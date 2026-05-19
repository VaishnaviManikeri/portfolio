// backend/controllers/projectController.js
const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Parse form data - handle both stringified JSON and direct values
    let title, description, tags, category, link, featured, order;
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      // If tags is a JSON string, parse it
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        // If it's a comma-separated string
        tags = req.body.tags.split(',').map(tag => tag.trim());
      }
    } else if (req.body.tags && Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (req.body.tags) {
      tags = [req.body.tags];
    } else {
      tags = [];
    }
    
    title = req.body.title;
    description = req.body.description;
    category = req.body.category;
    link = req.body.link;
    featured = req.body.featured === 'true' || req.body.featured === true;
    order = parseInt(req.body.order) || 0;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }
    
    if (!link) {
      return res.status(400).json({
        success: false,
        message: 'Website link is required'
      });
    }
    
    // Upload image to Cloudinary
    let imageUrl = '';
    let imagePublicId = '';
    
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'portfolio/projects',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    } else {
      // Use default image if no image uploaded
      imageUrl = 'https://via.placeholder.com/800x600?text=Project+Image';
      imagePublicId = 'default';
    }
    
    const project = new Project({
      title,
      description,
      image: imageUrl,
      imagePublicId,
      tags,
      category,
      link,
      featured,
      order
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update request file:', req.file);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Parse form data
    let title, description, tags, category, link, featured, order;
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = req.body.tags.split(',').map(tag => tag.trim());
      }
    } else if (req.body.tags && Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (req.body.tags) {
      tags = [req.body.tags];
    } else {
      tags = project.tags;
    }
    
    title = req.body.title || project.title;
    description = req.body.description || project.description;
    category = req.body.category || project.category;
    link = req.body.link || project.link;
    featured = req.body.featured === 'true' || req.body.featured === true || project.featured;
    order = parseInt(req.body.order) || project.order;
    
    // Handle image update
    let imageUrl = project.image;
    let imagePublicId = project.imagePublicId;
    
    if (req.file) {
      // Delete old image from Cloudinary
      if (project.imagePublicId && project.imagePublicId !== 'default') {
        await cloudinary.uploader.destroy(project.imagePublicId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'portfolio/projects',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' }
        ]
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }
    
    // Update project
    project.title = title;
    project.description = description;
    project.image = imageUrl;
    project.imagePublicId = imagePublicId;
    project.tags = tags;
    project.category = category;
    project.link = link;
    project.featured = featured;
    project.order = order;
    project.updatedAt = Date.now();
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Delete image from Cloudinary
    if (project.imagePublicId && project.imagePublicId !== 'default') {
      await cloudinary.uploader.destroy(project.imagePublicId);
    }
    
    await project.deleteOne();
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get projects by category
exports.getProjectsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const projects = await Project.find({ category }).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        token,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};   