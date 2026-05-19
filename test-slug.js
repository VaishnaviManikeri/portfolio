// backend/test-slug.js
const mongoose = require('mongoose');
require('dotenv').config();

const testSlug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Blog = require('./models/Blog');
    
    // First, drop the collection to start fresh (optional)
    // await Blog.collection.drop();
    
    // Test creating a blog
    const testBlog = new Blog({
      title: 'Test Blog Post',
      excerpt: 'This is a test excerpt for my blog post',
      content: '<p>This is the main content of the test blog post.</p><p>It contains multiple paragraphs.</p>',
      featuredImage: 'https://via.placeholder.com/1200x630?text=Test+Image',
      imagePublicId: 'test123',
      category: 'Technology',
      tags: ['test', 'blog', 'javascript'],
      author: 'Vaishnavi Manikeri',
      featured: false,
      published: true,
      readTime: 3
    });
    
    await testBlog.save();
    console.log('✅ Blog created successfully!');
    console.log('Title:', testBlog.title);
    console.log('Slug:', testBlog.slug);
    console.log('ID:', testBlog._id);
    
    // Test finding by slug
    const foundBlog = await Blog.findOne({ slug: testBlog.slug });
    console.log('\n✅ Found blog by slug:', foundBlog ? 'Success' : 'Failed');
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  }
};

testSlug();