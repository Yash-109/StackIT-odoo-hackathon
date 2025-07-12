const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../server/.env' });

// Import models
const User = require('../server/models/User');
const Question = require('../server/models/Question');
const Answer = require('../server/models/Answer');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    language: 'en',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    reputation: 150,
    isVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    language: 'en',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
    reputation: 200,
    isVerified: true
  },
  {
    name: 'राहुल कुमार',
    email: 'rahul@example.com',
    password: 'password123',
    language: 'hi',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=random',
    reputation: 100,
    isVerified: false
  }
];

const sampleQuestions = [
  {
    title: 'How to implement authentication in React?',
    content: 'I am building a React application and need to implement user authentication. What are the best practices for handling login, logout, and protected routes?',
    tags: ['react', 'authentication', 'javascript'],
    language: 'en',
    votes: 15,
    views: 120
  },
  {
    title: 'React में authentication कैसे implement करें?',
    content: 'मैं एक React application बना रहा हूं और user authentication implement करना चाहता हूं। Login, logout और protected routes के लिए best practices क्या हैं?',
    tags: ['react', 'authentication', 'javascript'],
    language: 'hi',
    votes: 8,
    views: 85
  },
  {
    title: 'Best practices for MongoDB schema design',
    content: 'I am designing a database schema for a Q&A platform. What are the best practices for MongoDB schema design to ensure good performance and scalability?',
    tags: ['mongodb', 'database', 'schema-design'],
    language: 'en',
    votes: 12,
    views: 95
  }
];

const sampleAnswers = [
  {
    content: 'For React authentication, I recommend using JWT tokens with Context API or Redux for state management. You can also use libraries like Auth0 or Firebase Auth for easier implementation.',
    votes: 8
  },
  {
    content: 'React authentication के लिए, मैं JWT tokens के साथ Context API या Redux का उपयोग करने की सलाह देता हूं। आप आसान implementation के लिए Auth0 या Firebase Auth जैसी libraries भी use कर सकते हैं।',
    votes: 5
  },
  {
    content: 'For MongoDB schema design, consider embedding documents for one-to-few relationships and using references for one-to-many. Always create indexes on frequently queried fields.',
    votes: 10
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create questions
    const createdQuestions = [];
    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];
      const question = await Question.create({
        ...questionData,
        author: createdUsers[i % createdUsers.length]._id
      });
      createdQuestions.push(question);
      console.log(`✅ Created question: ${question.title}`);
    }

    // Create answers
    for (let i = 0; i < sampleAnswers.length; i++) {
      const answerData = sampleAnswers[i];
      const answer = await Answer.create({
        ...answerData,
        author: createdUsers[i % createdUsers.length]._id,
        question: createdQuestions[i % createdQuestions.length]._id
      });
      console.log(`✅ Created answer for question: ${createdQuestions[i % createdQuestions.length].title}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Created ${createdUsers.length} users`);
    console.log(`📊 Created ${createdQuestions.length} questions`);
    console.log(`📊 Created ${sampleAnswers.length} answers`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 