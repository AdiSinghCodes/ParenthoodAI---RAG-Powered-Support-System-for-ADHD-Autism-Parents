import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ActivityCard from '@/components/activities/ActivityCard';
import ActivityQuiz from '@/components/activities/ActivityQuiz';

interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  quizItems: {
    image: string;
    correctAnswer: string;
    options: string[];
    explanation?: string;
  }[];
}

const activities: Activity[] = [
  {
    id: 'dangerous-objects',
    title: 'Dangerous Objects Awareness',
    description: 'Help your child learn about potentially dangerous objects in daily life and how to stay safe around them.',
    image: '/public/activities/dangerous-objects.jpeg',
    quizItems: [
      {
        image: '/public/activities/knife.jpeg',
        correctAnswer: 'Knife',
        options: ['Apple', 'Knife', 'Pencil', 'Pen']
      },
      {
        image: '/public/activities/scissors.jpeg',
        correctAnswer: 'Scissors',
        options: ['Scissors', 'Ruler', 'Book', 'Toy']
      },
      {
        image: '/public/activities/medicine.jpeg',
        correctAnswer: 'Medicine',
        options: ['Candy', 'Medicine', 'Juice', 'Water']
      },
      {
        image: '/public/activities/electrical-outlet.jpeg',
        correctAnswer: 'Electrical Outlet',
        options: ['Electrical Outlet', 'Picture', 'Window', 'Door']
      }
    ]
  },
  {
    id: 'road-safety',
    title: 'Road Safety Basics',
    description: 'Teach your child essential road safety rules and how to stay safe when crossing streets.',
    image: '/public/activities/road-safety.jpeg',
    quizItems: [
      {
        image: '/public/activities/crosswalk.jpeg',
        correctAnswer: 'Crosswalk',
        options: ['Crosswalk', 'Playground', 'Park', 'School']
      },
      {
        image: '/public/activities/traffic-light.jpeg',
        correctAnswer: 'Red Light',
        options: ['Red Light', 'Green Light', 'Yellow Light', 'Blue Light']
      },
      {
        image: '/public/activities/seatbelt.jpeg',
        correctAnswer: 'Seatbelt',
        options: ['Seatbelt', 'Toy', 'Book', 'Snack']
      },
      {
        image: '/public/activities/helmet.jpeg',
        correctAnswer: 'Helmet',
        options: ['Helmet', 'Hat', 'Cap', 'Scarf']
      }
    ]
  },
  {
    id: 'good-touch',
    title: 'Understanding Good Touch',
    description: 'Help your child learn about appropriate and safe physical contact in daily life.',
    image: '/public/activities/good-touch.jpeg',
    quizItems: [
      {
        image: '/public/activities/hug-parent.jpeg',
        correctAnswer: 'Yes',
        options: ['Yes', 'No'],
        explanation: 'A hug from a parent or family member is a good touch that makes us feel safe and loved.'
      },
      {
        image: '/public/activities/high-five.jpeg',
        correctAnswer: 'Yes',
        options: ['Yes', 'No'],
        explanation: 'A high-five with friends or teachers is a good touch that shows celebration and friendship.'
      },
      {
        image: '/public/activities/doctor-checkup.jpeg',
        correctAnswer: 'Yes',
        options: ['Yes', 'No'],
        explanation: 'When a doctor checks your health with a parent present, it is a good touch for your safety.'
      },
      {
        image: '/public/activities/helping-hand.jpeg',
        correctAnswer: 'Yes',
        options: ['Yes', 'No'],
        explanation: 'When someone helps you up after a fall, it is a good touch that shows care and support.'
      }
    ]
  },
  {
    id: 'bad-touch',
    title: 'Understanding Bad Touch',
    description: 'Teach your child to recognize inappropriate physical contact and how to respond safely.',
    image: '/public/activities/bad-touch.jpeg',
    quizItems: [
      {
        image: '/public/activities/secret-touch.jpeg',
        correctAnswer: 'No',
        options: ['Yes', 'No'],
        explanation: 'If someone asks you to keep a touch secret, it is a bad touch. Always tell a trusted adult.'
      },
      {
        image: '/public/activities/unwanted-hug.jpeg',
        correctAnswer: 'No',
        options: ['Yes', 'No'],
        explanation: 'If someone hugs you and you feel uncomfortable, it is a bad touch. You can say "No" and tell a trusted adult.'
      },
      {
        image: '/public/activities/private-parts.jpeg',
        correctAnswer: 'No',
        options: ['Yes', 'No'],
        explanation: 'If someone touches your private parts, it is a bad touch. Tell a trusted adult immediately.'
      },
      {
        image: '/public/activities/stranger-touch.jpeg',
        correctAnswer: 'No',
        options: ['Yes', 'No'],
        explanation: 'If a stranger tries to touch you, it is a bad touch. Run away and tell a trusted adult.'
      }
    ]
  }
];

const Activity: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleStartActivity = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleCompleteActivity = () => {
    setSelectedActivity(null);
  };

  if (selectedActivity) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4">
          <div className="container max-w-4xl mx-auto">
            <ActivityQuiz
              title={selectedActivity.title}
              description={selectedActivity.description}
              quizItems={selectedActivity.quizItems}
              onComplete={handleCompleteActivity}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-semibold rounded-full mb-4">
              🎮 Interactive Learning
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learning Activities
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help your child learn important safety concepts through interactive activities.
              Each activity includes engaging images and multiple-choice questions to reinforce learning.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                title={activity.title}
                description={activity.description}
                image={activity.image}
                onStart={() => handleStartActivity(activity)}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Activity; 