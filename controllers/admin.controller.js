const adminService = require('../services/admin.service');

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
