const repository = require('../repositories/admin.repository');

async function updateHeroSection(heroContent) {
  return await repository.putHeroSection(heroContent);
}

async function updateSkills(skills) {
  return await repository.putSkills(skills);
}

async function createSkill(skillPayload) {
  return await repository.postSkill(skillPayload);
}

async function deleteSkill(id) {
  return await repository.deleteSkillById(id);
}

async function updateCompanies(companies) {
  return await repository.putCompanies(companies);
}

async function createCompany(companyPayload) {
  return await repository.postCompany(companyPayload);
}

async function deleteCompany(companyId) {
  return await repository.deleteCompanyById(companyId);
}

async function createCompanyProject(projectPayload) {
  return await repository.postCompanyProject(projectPayload);
}

async function deleteProject(projectId) {
  return await repository.deleteProjectById(projectId);
}

async function updatePersonalProject(projects) {
  return await repository.putPersonalProjects(projects);
}

async function createPersonalProject(project) {
  return await repository.postPersonalProject(project);
}

async function deletePersonalProject(id) {
  return await repository.deletePersonalProjectById(id);
}

async function updateExperience(experiences) {
  return await repository.putExperience(experiences);
}

async function createExperience(payload) {
  return await repository.postExperience(payload);
}

async function deleteExperience(id) {
  return await repository.deleteExperienceById(id);
}

module.exports = {
  updateHeroSection,
  updateSkills,
  createSkill,
  deleteSkill,
  updateCompanies,
  createCompany,
  deleteCompany,
  createCompanyProject,
  deleteProject,
  updatePersonalProject,
  createPersonalProject,
  deletePersonalProject,
  updateExperience,
  createExperience,
  deleteExperience,
};
