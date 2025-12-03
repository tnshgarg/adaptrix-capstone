const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Adapter = require('./models/Adapter');
const Review = require('./models/Review');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const categories = ['Development', 'Content Creation', 'Data Science', 'Business', 'Healthcare', 'Legal'];
const models = ['Llama 3.1', 'Mistral 7B', 'Gemma 2B', 'Phi-3', 'Qwen 2'];

const adapterData = [
  { name: 'Code Enhancer Pro', description: 'Enhanced code generation with better syntax understanding', category: 'Development', tags: ['coding', 'syntax', 'development'] },
  { name: 'Creative Writer AI', description: 'Specialized adapter for creative writing and storytelling', category: 'Content Creation', tags: ['writing', 'creative', 'storytelling'] },
  { name: 'Data Analyst Plus', description: 'Optimized for data analysis and statistical modeling', category: 'Data Science', tags: ['data', 'analytics', 'ml'] },
  { name: 'Business Strategy Guide', description: 'Professional business analysis and strategic planning', category: 'Business', tags: ['business', 'strategy', 'analysis'] },
  { name: 'Medical Assistant Lite', description: 'Medical terminology and healthcare information processing', category: 'Healthcare', tags: ['medical', 'healthcare', 'clinical'] },
  { name: 'Legal Document Pro', description: 'Legal document analysis and contract review', category: 'Legal', tags: ['legal', 'contracts', 'compliance'] },
  { name: 'Marketing Genius', description: 'Marketing content creation and campaign strategy', category: 'Business', tags: ['marketing', 'content', 'campaigns'] },
  { name: 'Science Tutor', description: 'Scientific explanations and educational content', category: 'Content Creation', tags: ['education', 'science', 'tutoring'] },
  { name: 'Finance Advisor', description: 'Financial analysis and investment recommendations', category: 'Business', tags: ['finance', 'investment', 'advisory'] },
  { name: 'Research Assistant', description: 'Academic research and literature review assistance', category: 'Data Science', tags: ['research', 'academic', 'literature'] },
  { name: 'UX Designer Helper', description: 'User experience design and interface optimization', category: 'Development', tags: ['ux', 'design', 'ui'] },
  { name: 'SEO Optimizer', description: 'Search engine optimization and content ranking', category: 'Content Creation', tags: ['seo', 'optimization', 'ranking'] },
  { name: 'Customer Support Bot', description: 'Customer service and support ticket handling', category: 'Business', tags: ['support', 'customer', 'service'] },
  { name: 'Translation Expert', description: 'Multi-language translation with context awareness', category: 'Content Creation', tags: ['translation', 'languages', 'localization'] },
  { name: 'Security Analyst', description: 'Cybersecurity analysis and threat detection', category: 'Development', tags: ['security', 'cyber', 'threat'] },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Adapter.deleteMany({});
    await Review.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      { name: 'John Doe', email: 'john@example.com', password: hashedPassword },
      { name: 'Jane Smith', email: 'jane@example.com', password: hashedPassword },
      { name: 'Bob Wilson', email: 'bob@example.com', password: hashedPassword },
      { name: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create adapters
    console.log('📦 Creating adapters...');
    const adapters = [];

    for (let i = 0; i < adapterData.length; i++) {
      const data = adapterData[i];
      const user = users[i % users.length];
      
      const adapter = await Adapter.create({
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        category: data.category,
        tags: data.tags,
        compatibleModels: [models[i % models.length]],
        version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        license: 'MIT',
        readme: `# ${data.name}\n\n${data.description}\n\n## Installation\n\nInstall using the Adaptrix CLI:\n\`\`\`\nadaptrix install ${data.name.toLowerCase().replace(/\s+/g, '-')}\n\`\`\`\n\n## Usage\n\nDetailed usage instructions coming soon.`,
        isPublic: true,
        downloads: Math.floor(Math.random() * 10000),
        starCount: Math.floor(Math.random() * 500),
        authorId: user._id,
        size: `${(Math.random() * 3 + 1).toFixed(1)}GB`,
        fileUrl: `https://res.cloudinary.com/dad2tvyjl/raw/upload/v1764739498/adaptrix/adapters/adapter-1764739491599-266860325.safetensors`,
        fileName: `${data.name.toLowerCase().replace(/\s+/g, '-')}.safetensors`,
      });

      adapters.push(adapter);
    }

    console.log(`✅ Created ${adapters.length} adapters`);

    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviews = [];

    for (const adapter of adapters) {
      // Create 2-5 reviews per adapter
      const reviewCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < reviewCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        
        // Avoid duplicate reviews from same user
        const existingReview = reviews.find(
          r => r.userId.toString() === user._id.toString() && r.adapterId.toString() === adapter._id.toString()
        );
        
        if (!existingReview) {
          const review = await Review.create({
            userId: user._id,
            adapterId: adapter._id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            comment: [
              'Great adapter! Really improved my workflow.',
              'Excellent quality and easy to use.',
              'Works perfectly with my model.',
              'Highly recommended for this use case.',
              'Very helpful and well documented.',
              'Good performance, exactly what I needed.',
            ][Math.floor(Math.random() * 6)],
          });
          
          reviews.push(review);
        }
      }
    }

    console.log(`✅ Created ${reviews.length} reviews`);
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Adapters: ${adapters.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log('\n🔐 Test credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
