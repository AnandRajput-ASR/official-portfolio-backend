const contentService = require('../services/content.service');

exports.getContent = async (_, res) => {
  try {
    const data = await contentService.getPageContent();
    return res.json(data);
  } catch (err) {
    console.error('Error in getPageContent:', err);
    return res.status(500).json({ message: 'Error reading content.' });
  }
};

// Hero
exports.getHero = async (_, res) => {
  try {
    const hero = await contentService.getHero();
    return res.json(hero);
  } catch (err) {
    console.error('Error reading hero content:', err);
    return res.status(500).json({ message: 'Error reading hero content.' });
  }
};

exports.updateHero = async (req, res) => {
  try {
    const { heroId, name, title, subtitle } = req.body;
    const updatedHero = await contentService.putHero({ id: heroId, name, title, subtitle });
    return res.json(updatedHero);
  } catch (err) {
    console.error('Error updating hero content:', err);
    return res.status(500).json({ message: 'Error updating hero content.' });
  }
};

exports.getContactInfo = async (_, res) => {
  try {
    const contactInfo = await contentService.getContactInfo();
    return res.json(contactInfo);
  } catch (err) {
    console.error('Error reading contact information:', err);
    return res.status(500).json({ message: 'Error reading contact information.' });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    const { contactInfoId, email, linkedin, github, location } = req.body;
    const updatedContactInfo = await contentService.putContactInfo({
      id: contactInfoId,
      email,
      linkedin,
      github,
      location,
    });
    return res.json(updatedContactInfo);
  } catch (err) {
    console.error('Error updating contact information:', err);
    return res.status(500).json({ message: 'Error updating contact information.' });
  }
};

exports.getSkills = async (_, res) => {
  try {
    const skills = await contentService.getSkills();
    return res.json(skills);
  } catch (err) {
    console.error('Error reading skills:', err);
    return res.status(500).json({ message: 'Error reading skills.' });
  }
};

exports.getCompanies = async (_, res) => {
  try {
    const companies = await contentService.getCompanies();
    return res.json(companies);
  } catch (err) {
    console.error('Error reading companies:', err);
    return res.status(500).json({ message: 'Error reading companies.' });
  }
};

exports.getPersonalProjects = async (_, res) => {
  try {
    const personalProjects = await contentService.getPersonalProjects();
    return res.json(personalProjects);
  } catch (err) {
    console.error('Error reading personal projects:', err);
    return res.status(500).json({ message: 'Error reading personal projects.' });
  }
};

exports.getExperience = async (_, res) => {
  try {
    const experience = await contentService.getExperience();
    return res.json(experience);
  } catch (err) {
    console.error('Error reading experience:', err);
    return res.status(500).json({ message: 'Error reading experience.' });
  }
};

exports.getStats = async (_, res) => {
  try {
    const stats = await contentService.getStats();
    return res.json(stats);
  } catch (err) {
    console.error('Error reading stats:', err);
    return res.status(500).json({ message: 'Error reading stats.' });
  }
};

exports.getCertification = async (_, res) => {
  try {
    const certification = await contentService.getCertification();
    return res.json(certification);
  } catch (err) {
    console.error('Error reading certifications:', err);
    return res.status(500).json({ message: 'Error reading certifications.' });
  }
};

exports.getTestimonials = async (_, res) => {
  try {
    const testimonials = await contentService.getTestimonials();
    return res.json(testimonials);
  } catch (err) {
    console.error('Error reading testimonials:', err);
    return res.status(500).json({ message: 'Error reading testimonials.' });
  }
};

exports.getBlogPosts = async (_, res) => {
  try {
    const blogPosts = await contentService.getBlogPosts();
    return res.json(blogPosts);
  } catch (err) {
    console.error('Error reading blog posts:', err);
    return res.status(500).json({ message: 'Error reading blog posts.' });
  }
};

exports.getAnalytics = async (_, res) => {
  try {
    const analytics = await contentService.getAnalytics();
    return res.json(analytics);
  } catch (err) {
    console.error('Error reading analytics:', err);
    return res.status(500).json({ message: 'Error reading analytics.' });
  }
};

exports.getPendingTestimonials = async (_, res) => {
  try {
    const pendingTestimonials = await contentService.getPendingTestimonials();
    return res.json(pendingTestimonials);
  } catch (err) {
    console.error('Error reading pending testimonials:', err);
    return res.status(500).json({ message: 'Error reading pending testimonials.' });
  }
};
