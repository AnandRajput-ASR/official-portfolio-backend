const adminService = require('../services/admin.service');
const settingsService = require('../services/settings.service');

exports.getContent = async (_, res) => {
  try {
    const data = await adminService.getPageContent();
    return res.json(data);
  } catch (err) {
    console.error('Error in getPageContent:', err);
    return res.status(500).json({ message: 'Error reading content.' });
  }
};

exports.updateHeroSection = async (req, res) => {
  try {
    const { name, title, subtitle, bio, email, linkedin, github, location } = req.body;
    console.table({ name, title, subtitle, bio, email, linkedin, github, location });
    const updatedHero = await adminService.updateHeroSection({
      name,
      title,
      subtitle,
      bio,
      email,
      linkedin,
      github,
      location,
    });
    return res.json({ success: true, message: 'Hero section updated successfully', data: updatedHero });
  } catch (err) {
    console.error('Error updating hero section:', err);
    return res.status(500).json({ success: false, message: 'Failed to update hero section' });
  }
};

exports.updateSkills = async (req, res) => {
  try {
    const skills = req.body;
    const updatedSkills = await adminService.updateSkills(skills);
    return res.json({ success: true, message: 'Skills updated successfully', data: updatedSkills });
  } catch (err) {
    console.error('Error updating skills:', err);
    return res.status(500).json({ success: false, message: 'Failed to update skills' });
  }
};

exports.createSkill = async (req, res) => {
  try {
    const { name, icon, accentColor, description, tags, proficiency, yearsExp, displayOrder } = req.body;
    const skill = await adminService.createSkill({
      name,
      icon,
      accentColor,
      description,
      tags,
      proficiency,
      yearsExp,
      displayOrder,
    });
    return res.json({ success: true, message: 'Skill created successfully', data: skill });
  } catch (err) {
    console.error('Error creating skill:', err);
    return res.status(500).json({ success: false, message: 'Failed to create skill' });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSkill = await adminService.deleteSkill(id);
    if (!deletedSkill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }
    return res.json({ success: true, message: 'Skill deleted successfully', data: deletedSkill });
  } catch (err) {
    console.error('Error deleting skill:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete skill' });
  }
};

exports.updateCompanies = async (req, res) => {
  try {
    const companies = req.body;
    const result = await adminService.updateCompanies(companies);
    return res.json({ success: true, message: 'Companies updated successfully', data: result });
  } catch (err) {
    console.error('Error updating companies:', err);
    return res.status(500).json({ success: false, message: 'Failed to update companies' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, role, period, location, logo, accentColor, current, description, projects } = req.body;
    const company = await adminService.createCompany({
      name,
      role,
      period,
      location,
      logo,
      accentColor,
      current,
      description,
      projects,
    });
    return res.json({ success: true, message: 'Company created successfully', data: company });
  } catch (err) {
    console.error('Error creating company:', err);
    return res.status(500).json({ success: false, message: 'Failed to create company' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await adminService.deleteCompany(id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    return res.json({ success: true, message: 'Company deleted successfully', data: company });
  } catch (err) {
    console.error('Error deleting company:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
};

exports.createCompanyProject = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { title, description, tech, link } = req.body;
    const project = await adminService.createCompanyProject({
      companyId,
      title,
      description,
      tech,
      link,
    });
    return res.json({ success: true, message: 'Project created successfully', data: project });
  } catch (err) {
    console.error('Error creating project:', err);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('Deleting project:', projectId);

    const deletedProject = await adminService.deleteProject(projectId);
    if (!deletedProject) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({
      success: true,
      message: 'Project deleted successfully',
      data: deletedProject,
    });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

exports.updatePersonalProject = async (req, res) => {
  try {
    const projects = req.body;

    const updated = await adminService.updatePersonalProject(projects);

    return res.json({
      success: true,
      message: 'Personal projects updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating personal projects:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to update personal projects',
    });
  }
};

exports.createPersonalProject = async (req, res) => {
  try {
    const project = req.body;

    const created = await adminService.createPersonalProject(project);

    return res.json({
      success: true,
      message: 'Personal project created successfully',
      data: created,
    });
  } catch (err) {
    console.error('Error creating personal project:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to create personal project',
    });
  }
};

exports.deletePersonalProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await adminService.deletePersonalProject(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    return res.json({
      success: true,
      message: 'Personal project deleted successfully',
      data: deleted,
    });
  } catch (err) {
    console.error('Error deleting personal project:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete personal project',
    });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const experiences = req.body;

    const updated = await adminService.updateExperience(experiences);

    return res.json({
      success: true,
      message: 'Experience updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating experience:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to update experience',
    });
  }
};

exports.createExperience = async (req, res) => {
  try {
    const payload = req.body;

    const created = await adminService.createExperience(payload);

    return res.json({
      success: true,
      message: 'Experience created successfully',
      data: created,
    });
  } catch (err) {
    console.error('Error creating experience:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to create experience',
    });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await adminService.deleteExperience(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    return res.json({
      success: true,
      message: 'Experience deleted successfully',
      data: deleted,
    });
  } catch (err) {
    console.error('Error deleting experience:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete experience',
    });
  }
};

exports.syncStats = async (req, res) => {
  try {
    const stats = req.body;

    const result = await adminService.syncStats(stats);

    return res.json({
      success: true,
      message: 'Stats synchronized successfully',
      data: result,
    });
  } catch (err) {
    console.error('Error syncing stats:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to sync stats',
    });
  }
};

exports.updateCertification = async (req, res) => {
  try {
    const certifications = req.body;

    const updated = await adminService.updateCertification(certifications);

    return res.json({
      success: true,
      message: 'Certifications updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating certifications:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to update certifications',
    });
  }
};

exports.createCertification = async (req, res) => {
  try {
    const payload = req.body;

    const created = await adminService.createCertification(payload);

    return res.json({
      success: true,
      message: 'Certification created successfully',
      data: created,
    });
  } catch (err) {
    console.error('Error creating certification:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to create certification',
    });
  }
};

exports.deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await adminService.deleteCertification(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found',
      });
    }

    return res.json({
      success: true,
      message: 'Certification deleted successfully',
      data: deleted,
    });
  } catch (err) {
    console.error('Error deleting certification:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete certification',
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    const updated = await settingsService.updateSiteSettings(settings);

    res.json({
      message: 'Settings updated successfully',
      siteSettings: updated,
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

exports.getAllTestimonials = async (_, res) => {
  try {
    const testimonials = await adminService.getAllTestimonials();

    res.json({
      approved: testimonials.approved,
      pending: testimonials.pending,
    });
  } catch (err) {
    console.error('Error fetching testimonials:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
    });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const testimonials = req.body;

    await adminService.updateTestimonials(testimonials);

    return res.json({
      success: true,
      message: 'Testimonials updated successfully',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonials',
    });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = await adminService.createTestimonial(req.body);

    return res.json({
      success: true,
      message: 'Testimonial created',
      data: testimonial,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
    });
  }
};

exports.enableTestimonialById = async (req, res) => {
  try {
    const testimonial = await adminService.enableTestimonialById(req.params.id, req.body);

    return res.json({
      success: true,
      data: testimonial,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const deleted = await adminService.deleteTestimonial(req.params.id);

    return res.json({
      success: true,
      data: deleted,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

exports.submitTestimonial = async (req, res) => {
  try {
    const testimonial = await adminService.submitTestimonial(req.body);
    console.table(req.body);
    return res.json({
      success: true,
      message: 'Testimonial submitted for approval',
      data: testimonial,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

exports.approveTestimonial = async (req, res) => {
  try {
    const approved = await adminService.approveTestimonial(req.params.id);

    return res.json({
      success: true,
      data: approved,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

exports.rejectTestimonial = async (req, res) => {
  try {
    const rejected = await adminService.rejectTestimonial(req.params.id);

    return res.json({
      success: true,
      data: rejected,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

exports.deletePendingTestimonial = async (req, res) => {
  try {
    const deleted = await adminService.deletePendingTestimonial(req.params.id);

    return res.json({
      success: true,
      data: deleted,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
    });
  }
};

exports.updateBlogPost = async (req, res) => {
  try {
    const posts = req.body;

    const updated = await adminService.updateBlogPost(posts);

    res.json({
      success: true,
      message: 'Blog posts updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('Error updating blog posts:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to update blog posts',
    });
  }
};

exports.createBlogPost = async (req, res) => {
  try {
    const post = await adminService.createBlogPost(req.body);

    res.json({
      success: true,
      message: 'Blog post created successfully',
      data: post,
    });
  } catch (err) {
    console.error('Error creating blog post:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
    });
  }
};

exports.updateBlogPostById = async (req, res) => {
  try {
    const post = await adminService.updateBlogPostById(req.params.id, req.body);

    res.json({
      success: true,
      data: post,
    });
  } catch (err) {
    console.error('Error updating blog post:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
    });
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    const deleted = await adminService.deleteBlogPost(req.params.id);

    res.json({
      success: true,
      data: deleted,
    });
  } catch (err) {
    console.error('Error deleting blog post:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
    });
  }
};

exports.getAnalytics = async (_, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    console.table(analytics);
    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
    });
  }
};

exports.resetAnalytics = async (_, res) => {
  try {
    const result = await adminService.resetAnalytics();

    res.json({
      success: true,
      message: 'Analytics reset successfully',
      data: result,
    });
  } catch (err) {
    console.error('Error resetting analytics:', err);

    res.status(500).json({
      success: false,
    });
  }
};

exports.trackAnalyticsEvent = async (req, res) => {
  try {
    const { type } = req.body;

    const result = await adminService.trackAnalyticsEvent(type);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Error tracking analytics event:', err);

    res.status(500).json({
      success: false,
    });
  }
};
