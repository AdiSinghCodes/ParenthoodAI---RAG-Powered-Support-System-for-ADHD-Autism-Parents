import Groq from "groq-sdk";
import { QdrantClient } from "@qdrant/js-client-rest";
import neo4j, { Driver, Session } from "neo4j-driver";
import { mongoDBService } from './mongodb-service';

// Initialize Groq with enhanced configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
console.log("[Groq] API Key loaded:", GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : "NOT SET");

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development! Avoid in production.
});

// Initialize Qdrant client with proper URL format
const isLocalhost =
  import.meta.env.VITE_QUADRANT_HOST?.includes("localhost") ||
  !import.meta.env.VITE_QUADRANT_HOST;
const QDRANT_URL = import.meta.env.VITE_QUADRANT_HOST
  ? import.meta.env.VITE_QUADRANT_HOST.startsWith("http")
    ? import.meta.env.VITE_QUADRANT_HOST
    : `${isLocalhost ? "http" : "https"}://${
        import.meta.env.VITE_QUADRANT_HOST
      }`
  : "http://localhost:6333";

console.log("Using Qdrant URL:", QDRANT_URL);

const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: isLocalhost ? undefined : import.meta.env.VITE_QUADRANT_API_KEY,
  checkCompatibility: false,
});

// Initialize Neo4j driver with proper types
const neo4jDriver = neo4j.driver(
  import.meta.env.VITE_NEO4J_URL || "bolt://localhost:7687",
  neo4j.auth.basic(
    import.meta.env.VITE_NEO4J_USERNAME || "neo4j",
    import.meta.env.VITE_NEO4J_PASSWORD || "adminpassword"
  ),
  {
    maxConnectionPoolSize: 50,
    connectionTimeout: 5000,
  }
);

// Current supported models (as of Feb 2026)
const SUPPORTED_MODELS = {
  DEFAULT: "llama-3.3-70b-versatile", // Most capable and current model
  FAST: "llama-3.1-8b-instant", // Faster alternative
};

const DEFAULT_MODEL = SUPPORTED_MODELS.DEFAULT;
const DEFAULT_GREETING = "😊 Hello! I'm Dr. Joy, here to help!";
const DEFAULT_ERROR_RESPONSE =
  "I'm having trouble right now. Could you please try again? 🙏";

// --- UPDATED SYSTEM PROMPTS ---

// Standard system prompt - detailed version
const SYSTEM_PROMPT = `
You ARE **"Dr. Joy"** – India’s top **Neurodevelopmental Pediatrician** specializing in **ADHD + Autism**, blending **Western therapies + Indian parenting wisdom**.  

#### **CORE PERSONALITY**  
✅ **Warm, culturally sensitive** ("Beta, I understand your struggle")  
✅ **Practical, step-by-step guidance** for Indian homes/schools  
✅ **Non-judgmental** – fights stigma with science & empathy  
✅ **Uplifting yet realistic** – "Progress over perfection"  

#### **RESPONSE STYLE**  
🔹 **Language:** Matches user (English/Hindi/Hinglish/Regional)  
🔹 **Length:** **150-250 words** – detailed but actionable  
🔹 **Structure:**  
1. **Validation** ("Many parents feel this way")  
2. **Immediate Solution** ("Try this **today**")  
3. **Long-term Strategy** ("For **next 3 months**, do…")  
4. **Hope** ("Your child **will** thrive!")  

#### **ADHD + AUTISM EXPERTISE**  
🧠 **Focus & Hyperactivity:**  
- **School tips** (CBSE/ICSE IEP tricks)  
- **Homework hacks** (15-min "masala breaks")  
- **Indian diet tweaks** (reduce maida/sugar)  

🌿 **Sensory & Meltdowns:**  
- **Desi solutions** (weighted blanket from rajai)  
- **Meltdown prevention** (pre-festival rehearsals)  
- **Public judgement** ("Log kya kahenge?" comebacks)  

💡 **Social & Life Skills:**  
- **Friendship building** (via cricket/chess clubs)  
- **Chores training** (start with pooja plate setup)  
- **Future readiness** (vocational strengths)  

#### **RULES**  
❌ Never say "disability" – use **"unique abilities"**  
✅ Use **🇮🇳 emojis** (👶🏽, 📚, 🪷) for warmth  
✅ Suggest **local NGOs** (eg: "Contact **Action Autism India**")  
✅ **Bold key tips** for clarity 
`;

// Reasoning model system prompt - detailed version
const REASONING_SYSTEM_PROMPT = `
You ARE **"Dr. Joy"** – a leading Indian **Neurodevelopmental Specialist** with 20+ years of experience in **ADHD + Autism**. Your reasoning follows a **4-step clinical framework**, but ONLY the final advice is shared.  

#### **INTERNAL REASONING (Never Visible to User)**  
1️⃣ **CULTURAL CONTEXT ANALYSIS**  
   - Urban/Rural setting? Nuclear/Joint family?  
   - School type (Govt./Private/CBSE/ICSE)?  
   - Local stigma levels? ("Log kya kahenge?" fears)  

2️⃣ **ROOT-CAUSE DIAGNOSIS**  
   - Is it **sensory overload** (e.g., loud classrooms)?  
   - **Executive dysfunction** (forgetting homework)?  
   - **Social anxiety** (group activities triggering meltdowns)?  

3️⃣ **RESOURCE MAPPING**  
   - Affordable solutions (**DIY sensory tools**, local NGOs)  
   - Family support (**grandparents’ role**, sibling involvement)  
   - School collaboration (**IEP hacks for Indian systems**)  

4️⃣ **SOLUTION TIERING**  
   - **Emergency** (meltdown prevention)  
   - **Short-term** (3-month behavior shaping)  
   - **Long-term** (life skills & career prep)  

#### **EXTERNAL RESPONSE GUIDELINES**  
✅ **Language:** Match user’s (English/Hindi/Hinglish/Regional)  
✅ **Structure:**  
   - **Empathize First** ("I know how exhausting this is, beta")  
   - **3-Part Plan** (Today/This Month/Future)  
   - **Local Examples** ("A Delhi mom used…")  
✅ **Tone:**  
   - **Hopeful** ("Your child’s brain is like a unique algorithm!")  
   - **Anti-Stigma** ("Not ‘paagal’, just ‘different’")  
   - **Actionable** (**Bold key steps**)  

#### **RULES**  
❌ Never show internal reasoning steps  
✅ Use **🇮🇳 emojis** (👶🏽, 🪷, 📚) for warmth  
✅ Suggest **regional resources** (e.g., "Contact **ADAPT Mumbai**")  
✅ Debunk **myths** ("No, homeopathy won’t ‘cure’ autism") 
`;

// --- END OF UPDATED SYSTEM PROMPTS ---


// Memory implementation using Qdrant and Neo4j
class Memory {
  private qdrant: QdrantClient;
  private neo4j: Driver;
  private defaultCollectionName: string;
  private userId: string | null = null;
  private currentCollectionName: string;
  private initializationPromises: Map<string, Promise<void>> = new Map();


  constructor() {
    this.qdrant = qdrantClient;
    this.neo4j = neo4jDriver;
    this.defaultCollectionName = "parenting_mem";
    this.currentCollectionName = this.defaultCollectionName;
    // Initialize default collection and Neo4j constraints
    this.initializeCollections().catch((error) => {
      console.error("Failed to initialize default collections and Neo4j:", error);
    });
  }
  // Set the active user ID to create user-specific collections
  async setUserId(userId: string): Promise<this> {
    console.log("Setting user ID in Memory class:", userId);
    this.userId = userId;
    const newCollectionName = userId ? `parenting_mem_${userId}` : this.defaultCollectionName;
    
    if (this.currentCollectionName !== newCollectionName) {
      this.currentCollectionName = newCollectionName;
      console.log(`Current collection name set to: ${this.currentCollectionName} by setUserId`);
      try {
        await this.initializeCollection(this.currentCollectionName);
        console.log(`Collection ${this.currentCollectionName} ensured for user ${userId}.`);
      } catch (error) {
        console.error(`Failed to ensure collection ${this.currentCollectionName} for user ${userId}:`, error);
        // Depending on requirements, you might want to rethrow or handle this state
      }
    } else {
      console.log(`User ID set to ${userId}, but collection name ${this.currentCollectionName} remains the same. Ensuring it's initialized.`);
      try {
        await this.initializeCollection(this.currentCollectionName);
      } catch (error) {
         console.error(`Failed to re-ensure collection ${this.currentCollectionName} for user ${userId}:`, error);
      }
    }
    return this;
  }
  
  // Set a specific collection name for the current session
  async setCollectionName(collectionName: string): Promise<this> {
    console.log("Attempting to set collection name in Memory class to:", collectionName);
    if (this.currentCollectionName !== collectionName) {
      this.currentCollectionName = collectionName;
      console.log(`Current collection name updated to: ${this.currentCollectionName} by setCollectionName`);
      try {
        await this.initializeCollection(this.currentCollectionName);
        console.log(`Collection ${this.currentCollectionName} ensured.`);
      } catch (error) {
        console.error(`Failed to ensure collection ${collectionName}:`, error);
        // Depending on requirements, you might want to rethrow or handle this state
      }
    } else {
      console.log(`Collection name ${collectionName} is already set. Ensuring it's initialized.`);
       try {
        await this.initializeCollection(this.currentCollectionName);
      } catch (error) {
         console.error(`Failed to re-ensure collection ${this.currentCollectionName}:`, error);
      }
    }
    return this;
  }

  // Get the current active user ID
  getUserId(): string | null {
    return this.userId;
  }
  
  // Get the current collection name
  getCollectionName(): string {
    return this.currentCollectionName;
  }

  private async initializeCollections() {
    try {
      // Initialize default Qdrant collection
      await this.initializeCollection(this.defaultCollectionName);
      console.log(`Default collection ${this.defaultCollectionName} ensured.`);

      // Initialize Neo4j constraints and indexes
      const session = this.neo4j.session();
      try {
        // Execute each statement separately
        await session.run(`CREATE CONSTRAINT memory_id_constraint IF NOT EXISTS FOR (m:Memory) REQUIRE m.id IS UNIQUE`);
        await session.run(`CREATE CONSTRAINT user_id_constraint IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE`);
        await session.run(`CREATE INDEX memory_userId_index IF NOT EXISTS FOR (m:Memory) ON (m.userId)`);
        await session.run(`CREATE INDEX user_id_index IF NOT EXISTS FOR (u:User) ON (u.id)`);
        await session.run(`CREATE INDEX entity_name_index IF NOT EXISTS FOR (e:Entity) ON (e.name)`);
        console.log("Created Neo4j constraints and indexes");
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error("Error initializing collections:", error);
      throw error;
    }
  }
  
  private async initializeCollection(collectionName: string) {
    if (!collectionName) {
      console.error("Attempted to initialize a collection with an undefined or empty name.");
      throw new Error("Collection name cannot be empty.");
    }

    // Prevent duplicate concurrent initializations for the same collection name
    if (this.initializationPromises.has(collectionName)) {
      console.log(`Initialization for collection ${collectionName} is already in progress, awaiting existing promise.`);
      return this.initializationPromises.get(collectionName);
    }

    const promise = (async () => {
      try {
        console.log(`Starting initialization for Qdrant collection: ${collectionName}`);
        
        // First try to get collection info - if it exists and is properly configured, we're done
        try {
          const collectionInfo = await this.qdrant.getCollection(collectionName);
          if (collectionInfo && collectionInfo.config?.params?.vectors?.size === 1536) {
            console.log(`Collection ${collectionName} already exists and is properly configured.`);
            return;
          }
        } catch (getError: any) {
          if (getError.status !== 404) {
            console.error(`Unexpected error checking collection ${collectionName}:`, getError);
          }
        }

        // Collection doesn't exist or isn't properly configured - try to create it
        try {
          await this.qdrant.createCollection(collectionName, {
            vectors: {
              size: 1536,
              distance: "Cosine",
            },
            // Add optimizers config for better performance
            optimizers_config: {
              default_segment_number: 2,
              max_segment_size: 100000,
            },
          });
          console.log("Successfully created Qdrant collection:", collectionName);
        } catch (createError: any) {
          if (createError.status === 409) {
            console.log(`Collection ${collectionName} was created by another process, verifying configuration...`);
            // Double-check the configuration
            const collectionInfo = await this.qdrant.getCollection(collectionName);
            if (collectionInfo.config?.params?.vectors?.size !== 1536) {
              throw new Error(`Existing collection ${collectionName} has incorrect vector size`);
            }
          } else {
            throw createError;
          }
        }
      } catch (error) {
        console.error(`Error during initialization of collection ${collectionName}:`, error);
        throw error;
      } finally {
        this.initializationPromises.delete(collectionName);
      }
    })();
    
    this.initializationPromises.set(collectionName, promise);
    return promise;
  }

  private async getEmbedding(text: string): Promise<number[]> {
    try {
      // NOTE: As of late 2023/early 2024, Groq doesn't offer embedding models directly.
      // You MUST replace this with a call to an actual embedding provider (e.g., OpenAI, Cohere, BGE, etc.).
      // The `text-embedding-ada-002` is an OpenAI model name, not Groq.
      // **ACTION REQUIRED:** Replace this section with a working embedding call to a valid API.

      console.warn("Using a placeholder for embedding generation. Replace with actual embedding API call (e.g., OpenAI, Cohere, BGE).");
      // Example placeholder: return a fixed vector (not useful for semantic search)
      // Ensure the size matches the collection size (1536)
      return new Array(1536).fill(Math.random());

      // Example if using OpenAI (requires separate OpenAI setup/key)
      /*
      const OpenAI = require("openai"); // or import OpenAI from 'openai';
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.embeddings.create({
         model: "text-embedding-ada-002", // Or "text-embedding-3-small/large"
         input: text,
      });
      if (response.data && response.data.length > 0) {
         return response.data[0].embedding;
      }
      throw new Error("No embedding returned from Embedding provider");
      */

    } catch (error) {
      console.error("Error generating embedding:", error);
      // Return a zero vector as fallback (less ideal for search)
      return new Array(1536).fill(0);
    }
  }

  /**
   * Uses LLM to generate Cypher statements to populate the graph based on the user message.
   * @param content The user message content.
   * @param userId The ID of the user node to link to.
   * @returns A promise resolving to a string containing Cypher statements, or null if none generated/error.
   */
  private async extractGraphCypher(content: string, userId: string): Promise<string | null> {
      try {
          const response = await groq.chat.completions.create({
              model: DEFAULT_MODEL, // Or a smaller faster model if suitable
              messages: [
                  {
                      role: "system",
                      content: `Analyze the user message for key entities and relationships related to the user or their child.
Identify relevant concepts, people (child's name, family members, professionals), places, conditions (like ADHD), preferences, and topics discussed.
Generate Cypher MERGE statements to create these entities as nodes and link them to the main user node.
The user node already exists and has the label 'User' and a property 'id' with the value '${userId}'.
Link identified entities to the user node using descriptive relationships.
Use appropriate labels for new nodes (e.g., :Person, :Condition, :Food, :Location, :Professional, :Topic). Default to a generic label if unsure.
Set a 'name' property on the new nodes to store the entity's identifier.
Ensure relationships are uppercase and use underscores (e.g., :HAS_CHILD, :LIKES, :LOCATED_IN).
Output ONLY valid Cypher MERGE statements, separated by semicolons. Do NOT include any other text, explanations, or formatting like markdown code blocks.

Example Outputs:
User: "My son Rohit has ADHD."
Output: MERGE (u:User {id: '${userId}'}) MERGE (p:Person {name: 'Rohit'}) MERGE (c:Condition {name: 'ADHD'}) MERGE (u)-[:HAS_CHILD]->(p) MERGE (p)-[:HAS_CONDITION]->(c);

User: "I like biryani."
Output: MERGE (u:User {id: '${userId}'}) MERGE (f:Food {name: 'biryani'}) MERGE (u)-[:LIKES]->(f);

User: "We went to a clinic in Mumbai."
Output: MERGE (u:User {id: '${userId}'}) MERGE (pl:Place {name: 'a clinic'}) MERGE (l:Location {name: 'Mumbai'}) MERGE (u)-[:VISITED]->(pl) MERGE (pl)-[:LOCATED_IN]->(l);

User: "My name is John."
Output: MERGE (u:User {id: '${userId}'}) SET u.name = 'John'; // Explicitly set user's name property

Analyze the following message and generate Cypher:`,
                  },
                  {
                      role: "user",
                      content,
                  },
              ],
              temperature: 0.0, // Keep temperature low for factual extraction
              response_format: { type: "text" }, // Request raw text output
          });

          const cypherOutput = response.choices[0]?.message?.content?.trim();

          if (!cypherOutput) {
              console.log("Graph Cypher extraction LLM returned empty content.");
              return null;
          }

          console.log("LLM generated Cypher:\n", cypherOutput);

          // Basic validation: check if it looks like Cypher (starts with MERGE or SET)
          if (!cypherOutput.toUpperCase().startsWith("MERGE") && !cypherOutput.toUpperCase().startsWith("SET")) {
             console.warn("LLM output does not start with MERGE or SET. Assuming invalid Cypher.");
             return null;
          }


          return cypherOutput;

      } catch (error) {
          console.error("Error during graph Cypher extraction:", error);
          return null;
      }
  }

  async add(
    messages: Array<{ role: string; content: string }>,
    { userId, metadata = {} }: { userId: string; metadata?: any }
  ) {
    if (!this.currentCollectionName) {
      console.error("Cannot add memory: currentCollectionName is not set.");
      throw new Error("Memory collection not initialized. Call setUserId or setCollectionName first.");
    }

    await this.initializeCollection(this.currentCollectionName);
    
    try {
      console.log("Adding messages to memory:", messages, "userId:", userId);

      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error("Invalid messages array");
      }
      if (!userId) {
        throw new Error("Invalid userId");
      }

      await this.inWrite(async (session) => {
        // Ensure user node exists
        await session.run(
          `
          MERGE (u:User {id: $userId})
          RETURN u
          `,
          { userId }
        );
        console.log(`Ensured User node exists for userId: ${userId}`);

        for (const message of messages) {
          if (!message.content || !message.role) {
            console.warn("Skipping invalid message:", message);
            continue;
          }

          // Dynamic Graph Creation for user messages
          if (message.role === "user") {
            const cypherStatementsString = await this.extractGraphCypher(message.content, userId);
            if (cypherStatementsString) {
              const statements = cypherStatementsString.split(';').map(s => s.trim()).filter(Boolean);
              for (const statement of statements) {
                try {
                  await session.run(statement, { userId });
                  console.log(`Executed LLM-generated Cypher: ${statement}`);
                } catch (cypherError) {
                  console.error("Error executing LLM-generated Cypher statement:", statement, cypherError);
                }
              }
            }
          }

          // Store message in Neo4j
          const messageId = crypto.randomUUID();
          const timestamp = Date.now();
          const metadataStr = JSON.stringify(metadata);

          try {
            const result = await session.run(
              `
              MATCH (u:User {id: $userId})
              CREATE (m:Memory {
                id: $id,
                content: $content,
                role: $role,
                userId: $userId,
                timestamp: $timestamp,
                metadata: $metadata
              })
              CREATE (u)-[:HAS_MEMORY]->(m)
              RETURN m
              `,
              {
                id: messageId,
                content: message.content,
                role: message.role,
                userId,
                timestamp,
                metadata: metadataStr,
              }
            );
            
            const storedMessage = result.records[0]?.get("m").properties;
            if (!storedMessage) {
              console.error("Failed to store message as Neo4j Memory node.");
            } else {
              console.log("Successfully stored message as Memory node:", storedMessage.id);
            }

            // Store embedding in Qdrant
            const embedding = await this.getEmbedding(message.content);
            if (embedding && embedding.length === 1536 && embedding.some(v => v !== 0)) {
              await this.qdrant.upsert(this.currentCollectionName, {
                points: [{
                  id: messageId,
                  vector: embedding,
                  payload: {
                    userId,
                    content: message.content,
                    role: message.role,
                    timestamp,
                    metadata: metadataStr,
                  },
                }],
              });
              console.log("Successfully stored embedding in Qdrant for message:", messageId);
            } else {
              console.warn("Skipping Qdrant upsert due to invalid embedding.", { messageId, embeddingLength: embedding?.length });
            }
          } catch (error) {
            console.error("Error storing message:", error);
            throw error;
          }
        }
      });
    } catch (error) {
      console.error("Error adding memory:", error);
      throw error;
    }
  }

  async search(
    query: string,
    { userId }: { userId: string }
  ): Promise<{ results: Array<{ memory: string }> }> {
    if (!this.currentCollectionName) {
      console.error("Cannot search memory: currentCollectionName is not set.");
      // Fallback to default user-specific collection name if possible, or throw
      if (this.userId) {
        this.currentCollectionName = `parenting_mem_${this.userId}`;
        console.warn(`currentCollectionName was not set during search, attempting to use ${this.currentCollectionName}`);
        await this.initializeCollection(this.currentCollectionName);
      } else {
        throw new Error("Memory collection not initialized. Call setUserId or setCollectionName first.");
      }
    } else {
      // Ensure the collection is initialized before trying to search it.
      await this.initializeCollection(this.currentCollectionName);
    }

    try {
      return await this.inRead(async (session) => {
      console.log("Searching memories for query:", query, "userId:", userId);

      const results: Array<{ memory: string }> = [];

      // 1. Retrieve User's Name and directly connected graph data
      // Query finds the user and any node directly connected to it
      const graphResult = await session.run(
        `
        MATCH (u:User {id: $userId})
        // Find nodes directly connected to the user (one hop away)
        OPTIONAL MATCH (u)-[r]->(target)
        // Collect user's name and details about connected nodes/relationships
        RETURN u.name as userName, collect({
            relationshipType: type(r),
            targetName: target.name,
            targetLabels: labels(target)
        }) as relatedEntities
        `,
        { userId }
      );

      const graphRecord = graphResult.records[0];
      const userName = graphRecord?.get("userName");
      const relatedEntities = graphRecord?.get("relatedEntities") || [];

      console.log("Neo4j Graph Traversal Results:", { userName, relatedEntities });

      // Format graph data into context strings
      if (userName) {
        results.push({ memory: `The user's name is ${userName}.` });
      }

      if (relatedEntities.length > 0) {
          const graphContext = relatedEntities
              // Filter out entries where the target node might not have a 'name' property
              .filter((item: any) => item && item.targetName)
              .map((item: any) => {
                  const relType = String(item.relationshipType || '').toLowerCase().replace(/_/g, ' '); // Convert like HAS_CHILD to "has child"
                  const targetName = String(item.targetName);
                  const targetLabels = item.targetLabels?.length > 0 ? ` (${item.targetLabels.join(', ')})` : '';

                  // Attempt to create a descriptive sentence based on common relationships
                  if (relType === 'has child') return `The user's child is named ${targetName}.`;
                  if (relType === 'has condition') return `The user's child (or the user) has the condition ${targetName}.`;
                  if (relType === 'likes') return `The user likes ${targetName}.`;
                   if (relType === 'talked about') return `The user has mentioned ${targetName}.`;
                   if (relType === 'visited') return `The user visited ${targetName}.`;
                   if (relType === 'located in') return `${targetName} is located in ${item.targetName}.`; // This connection might need careful formatting or LLM interpretation
                   // Fallback for other relationships
                   return `The user is related to ${targetName}${targetLabels} via "${relType}".`;

              }).join('\n');
           if (graphContext) {
               results.push({ memory: `User related information from graph:\n${graphContext}` });
           }
      } else {
          console.log("No entities directly connected to the user found in the graph.");
      }


      // 2. Get embedding for the query and search in Qdrant
      const queryEmbedding = await this.getEmbedding(query);
       // Check if embedding is valid before searching
      if (queryEmbedding && queryEmbedding.length === 1536 && queryEmbedding.some(v => v !== 0)) {
           try {
                const searchResult = await this.qdrant.search(this.currentCollectionName, {
                    vector: queryEmbedding,
                    limit: 5, // Limit vector search results
                    filter: {
                        must: [
                            {
                                key: "userId",
                                match: { value: userId },
                            },
                             // Optionally filter by role if needed, e.g., only search user messages
                             // {
                             //   key: "role",
                             //   match: { value: "user" }
                             // }
                        ],
                    },
                });

                console.log("Qdrant vector search results:", searchResult);

                // Add vector search results to results array
                searchResult.forEach(result => {
                    if (result.payload?.content) {
                       // Indicate these are past conversation snippets
                       results.push({ memory: `Past Conversation Snippet (${result.payload.role}): ${result.payload.content}` });
                    }
                });

           } catch(vectorSearchError) {
               console.error("Error during Qdrant search:", vectorSearchError);
               // Continue without vector search results
           }
      } else {
           console.warn("Skipping Qdrant search due to invalid query embedding (getEmbedding likely returned placeholder).");
      }


      // 3. Get the most recent messages directly from Neo4j (for conversational context)
      // This is separate from the graph data but essential for chat flow
      const recentMessagesResult = await session.run(`
        MATCH (u:User {id: $userId})-[:HAS_MEMORY]->(m:Memory)
        WHERE m.role IN ['user', 'assistant'] // Include both user and assistant messages
        RETURN m.role as role, m.content as content, m.timestamp as timestamp
        ORDER BY m.timestamp DESC
        LIMIT 10 // Get last 10 messages
      `, { userId });

      // Add recent messages to context, ordered chronologically
      if (recentMessagesResult.records.length > 0) {
        const conversationHistory = recentMessagesResult.records
          .sort((a, b) => a.get('timestamp') - b.get('timestamp')) // Sort by timestamp ascending
          .map(record => `${record.get('role')}: ${record.get('content')}`)
          .join('\n');

        results.push({
          memory: `Recent conversation history:\n${conversationHistory}`
        });
      } else {
           console.log("No recent conversation history found.");
      }

      // Log the final list of memories being sent to the LLM
      console.log("Consolidated memories for LLM context:\n", results.map(r => r.memory).join('\n---\n'));      return { results }; // Return the array structure expected by generateResponse
    }, 'read');
    } catch (error) {
      console.error("Error searching memories:", error);
      return { results: [] };
    }
  }

  // getUserInfo method can be kept if needed elsewhere, but 'search' is used for LLM context
   async getUserInfo(userId: string): Promise<{ name?: string }> {
       return this.inRead(async (session) => {
         try {
             // Fetch just the user's name property from the User node
             const result = await session.run(
                 `
                 MATCH (u:User {id: $userId})
                 RETURN u.name as name
                 `,
                 { userId }
             );
             const record = result.records[0];
             return { name: record?.get("name") || undefined };
         } catch (error) {
             console.error("Error getting user info name:", error);
             return {};
         }
       });
   }

  private async withSession<T>(work: (session: Session) => Promise<T>): Promise<T> {
    const session = this.neo4j.session();
    try {
      return await work(session);
    } catch (error) {
      console.error('Neo4j session error:', error);
      throw error;
    } finally {
      try {
        await session.close();
      } catch (closeError) {
        console.error('Error closing Neo4j session:', closeError);
      }
    }
  }

  private async inWrite<T>(work: (session: Session) => Promise<T>): Promise<T> {
    return this.withSession(async (session) => {
      // Use Neo4j driver's writeTransaction instead of manual BEGIN/COMMIT
      return await session.executeWrite(async (tx) => {
        // Create a wrapper session-like object for compatibility
        const txSession = {
          run: tx.run.bind(tx)
        } as Session;
        return await work(txSession);
      });
    });
  }

  private async inRead<T>(work: (session: Session) => Promise<T>): Promise<T> {
    return this.withSession(async (session) => {
      // Use Neo4j driver's readTransaction instead of manual BEGIN READ/COMMIT
      return await session.executeRead(async (tx) => {
        // Create a wrapper session-like object for compatibility
        const txSession = {
          run: tx.run.bind(tx)
        } as Session;
        return await work(txSession);
      });
    });
  }
}

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};


// Initialize memory client
const memClient = new Memory();

// Health check utility
const checkAPIHealth = async (): Promise<boolean> => {
  try {
    console.log("[Groq] Checking API health...");
    await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
    });
    console.log("[Groq] API health check passed ✓");
    return true;
  } catch (error: any) {
    console.error("[Groq] API Health Check Failed:", error);
    console.error("[Groq] Health check error details:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type
    });
    return false;
  }
};

// Standard response function
const generateResponse = async (
  messages: GroqMessage[],
  useReasoning: boolean = false,
  onStream?: (chunk: string) => void,
  userId: string = "default"
): Promise<string> => {
  const systemPrompt = useReasoning ? REASONING_SYSTEM_PROMPT : SYSTEM_PROMPT;

  // Get user info and search for relevant memories
  const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";

  // Fetch user profile and memories in parallel
  const [userProfile, memResult] = await Promise.all([
    mongoDBService.getProfile(),
    memClient.search(lastUserMessage, { userId })
  ]);

  // Format profile data for context
  let profileContext = "";
  if (userProfile) {
    const { parentInfo, childInfo, adhdAndAutismInfo } = userProfile;
    profileContext = `
User Profile Information:
- Parent: ${parentInfo.name} (${parentInfo.profession})
- Child: ${childInfo.name}, age ${childInfo.age}, ${childInfo.gender}
${childInfo.isAdopted ? '- Child is adopted' : ''}
${parentInfo.isSingleParent ? `- Single parent (${parentInfo.singleParentRole})` : ''}
${adhdAndAutismInfo.hasCondition ? '- Child has ADHD/Autism condition' : ''}
${adhdAndAutismInfo.consultedDoctor ? '- Has consulted doctor' : ''}

Developmental Markers:
- Social Interactions: ${adhdAndAutismInfo.socialInteractions.description} (Level: ${adhdAndAutismInfo.socialInteractions.level})
- Behavioral Patterns: ${adhdAndAutismInfo.behavioralPatterns.description} (Level: ${adhdAndAutismInfo.behavioralPatterns.level})
- Developmental Milestones: ${adhdAndAutismInfo.developmentalMilestones.description} (Level: ${adhdAndAutismInfo.developmentalMilestones.level})
`;
  }

  // Format memories for context
  const memories = memResult.results.map(r => r.memory).filter(Boolean).join("\n---\n");

  // Enhanced system prompt with profile context
  const enhancedSystemPrompt = `${systemPrompt}

USER PROFILE CONTEXT:
${profileContext || "No profile information available."}

MEMORY CONTEXT:
${memories || "No previous context available."}

CRITICAL INSTRUCTIONS:
1. Use the provided USER PROFILE and MEMORY CONTEXT to inform your responses.
2. ALWAYS use the child's and parent's names from the profile when available.
3. Consider the child's specific developmental markers and conditions in your advice.
4. Tailor your responses to the family situation (single parent, adoption status, etc.)
5. Reference past interactions and behavioral patterns from the context.
6. Ensure your response adheres to the specified length constraints.
7. Follow all persona and rule instructions (tone, emojis, language, no asterisks).`;

  // Create a copy of messages to avoid mutating the original
  const messagesWithSystem = [...messages];

  // Ensure system prompt is first
  if (messagesWithSystem[0]?.role !== "system") {
    messagesWithSystem.unshift({
      role: "system",
      content: enhancedSystemPrompt,
    });
  } else {
    // Replace existing system prompt
    messagesWithSystem[0].content = enhancedSystemPrompt;
  }

  try {
    console.log("[Groq] Generating response with model:", DEFAULT_MODEL);
    console.log("[Groq] Messages count:", messagesWithSystem.length);
    
    // Generate response from Groq
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: useReasoning ? 400 : 150,
      stream: Boolean(onStream),
    });

    console.log("[Groq] Response received successfully");
    let responseContent = "";

    if (onStream && "stream" in response) {
      let fullResponse = "";
      const stream = response as unknown as AsyncIterable<{
        choices: Array<{ delta: { content: string } }>;
      }>;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        onStream(content);
      }
      responseContent = fullResponse;
    } else {
      responseContent =
        (response as { choices: Array<{ message: { content: string } }> })
          .choices[0]?.message?.content || DEFAULT_ERROR_RESPONSE;
    }

    // Post-process response: Remove asterisk symbols if they appear
    responseContent = responseContent.replace(/\*/g, '');

    // Store the conversation in memory
    try {
      // Only store the messages from the current turn
      const messagesToStore = messages.filter(m => m.role === 'user').slice(-1);
      if (responseContent !== DEFAULT_ERROR_RESPONSE) {
        messagesToStore.push({ role: "assistant", content: responseContent });
      }

      if (messagesToStore.length > 0) {
        await memClient.add(messagesToStore, {
          userId,
          metadata: { category: "chat", timestamp: Date.now() },
        });
      }
    } catch (memError) {
      console.error("[Memory] Failed to store in memory:", memError);
    }

    return responseContent;
  } catch (error: any) {
    console.error("[Groq] Error generating response:", error);
    console.error("[Groq] Error details:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type
    });
    return DEFAULT_ERROR_RESPONSE;
  }
};

// Get initial greeting
export const getInitialMessage = async (userId: string = "default"): Promise<string> => {
  try {
    if (!(await checkAPIHealth())) {
      throw new Error("API service unavailable");
    }

     // Attempt to retrieve user's name for a personalized greeting
    const userInfo = await memClient.getUserInfo(userId); // Use the simplified getUserInfo
    const userName = userInfo?.name;

    const greetingMessage = userName
        ? `Provide a warm 2-sentence personalized introduction as Dr. Kamraan to ${userName}, a concerned parent, including 1 relevant emoji. Start by addressing them by name. Keep it under 75 words.`
        : `Provide a warm 2-sentence introduction as Dr. Kamraan to a concerned parent, including 1 relevant emoji. Keep it under 75 words.`;

    return await generateResponse([
      {
        role: "user",
        content: greetingMessage,
      },
    ], false, undefined, userId); // Use standard prompt for greeting, no streaming
  } catch (error) {
    console.error("Initialization error:", error);
    return DEFAULT_GREETING;
  }
};

// Get response with optional reasoning
export const getDrKamraanResponse = async (
  userMessage: string,
  useReasoning: boolean = false,
  onStream?: (chunk: string) => void,
  retries: number = 2,
  userId: string = "default"
): Promise<string> => {
  if (!userMessage.trim()) return DEFAULT_ERROR_RESPONSE;

  // Prepare messages array - for a single turn, it's just the user message
  const messages = [{ role: "user", content: userMessage }] as GroqMessage[];

  try {
    return await generateResponse(
      messages,
      useReasoning,
      onStream,
      userId
    );
  } catch (error) {
    console.error("API Error (Attempt failed):", error);
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Retrying getDrKamraanResponse (${retries} retries left)...`);
      return getDrKamraanResponse(
        userMessage,
        useReasoning,
        onStream,
        retries - 1,
        userId
      );
    }
    console.error("API Error (Max retries reached):", error);
    return DEFAULT_ERROR_RESPONSE;
  }
};

// Handle chat history (passing full history)
export const getChatResponse = async (
  messages: Array<{ content: string; isUser: boolean }>,
  useReasoning: boolean = false,
  userId: string = "default"
): Promise<string> => {
  try {
    if (messages.length === 0) {
        // If no history, treat as initial message
       return getInitialMessage(userId);
    }

    const formattedMessages: GroqMessage[] = messages.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content,
    }));

    // Pass the full message history to generateResponse so the LLM has context,
    // but generateResponse will only add the *last* user message and assistant
    // response to the persistent memory stores (graph, qdrant, memory nodes)
    // to avoid redundant storage and processing of old messages.
    return await generateResponse(
      formattedMessages,
      useReasoning,
      undefined, // Chat response typically doesn't stream to the client directly like a single-turn API
      userId
    );
  } catch (error) {
    console.error("Conversation error:", error);
    return DEFAULT_ERROR_RESPONSE;
  }
};

// Export the memory client for direct access if needed
export { memClient, Memory };