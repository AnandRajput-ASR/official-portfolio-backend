const repository = require('../repositories/admin.repository');

async function updateHeroSection(heroContent) {
    return repository.putHeroSection(heroContent);
}

async function updateSkills(skills) {
    return repository.putSkills(skills);
}

async function createSkill(skillPayload) {
    return repository.postSkill(skillPayload);
}

async function deleteSkill(id) {
    return repository.deleteSkillById(id);
}

async function updateCompanies(companies) {
    return repository.putCompanies(companies);
}

async function createCompany(companyPayload) {
    return repository.postCompany(companyPayload);
}

async function deleteCompany(companyId) {
    return repository.deleteCompanyById(companyId);
}

async function createCompanyProject(projectPayload) {
    return repository.postCompanyProject(projectPayload);
}

async function deleteProject(projectId) {
    return repository.deleteProjectById(projectId);
}

async function updatePersonalProject(projects) {
    return repository.putPersonalProjects(projects);
}

async function createPersonalProject(project) {
    return repository.postPersonalProject(project);
}

async function deletePersonalProject(id) {
    return repository.deletePersonalProjectById(id);
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
    

}