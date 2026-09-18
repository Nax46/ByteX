import { connectDB, disconnectDB } from '../config/database.js';
import { seedFoundationData, SeedResult } from './foundationSeed.js';
import { seedAssessmentData, AssessmentSeedResult } from './assessmentSeed.js';
import { seedResourceData, ResourceSeedResult } from './resourceSeed.js';
import { seedProjectData, ProjectSeedResult } from './projectSeed.js';
import { seedDemoStudentData, DemoStudentSeedResult } from './demoStudentSeed.js';

export interface MasterSeedResult {
  foundation: SeedResult;
  assessment: AssessmentSeedResult;
  resources: ResourceSeedResult;
  projects: ProjectSeedResult;
  demoStudent: DemoStudentSeedResult;
}

/**
 * Master Seed Runner for AI SkillPath Person 2.
 * Runs all seed tasks in strict dependency order:
 * 1. Foundation (Skills, Careers, CareerSkills)
 * 2. Assessment (Diagnostic & Questions)
 * 3. Resources (Curated Learning Catalog)
 * 4. Projects (Hands-on Portfolio Assignments)
 * 5. Demo Student Persona (Complete E2E Demo Persona)
 *
 * 100% Idempotent, Non-destructive, and safe to execute repeatedly.
 */
export const seedMaster = async (): Promise<MasterSeedResult> => {
  console.log('========================================');
  console.log('AI SkillPath — Starting Master Seed Process');
  console.log('========================================');

  // Step 1: Foundation Seed
  console.log('\n[1/5] Seeding Foundation Data (Skills, Careers, Requirements)...');
  const foundation = await seedFoundationData();
  console.log(`  ✓ Processed ${foundation.skillsProcessed} skills, ${foundation.careersProcessed} careers, ${foundation.careerSkillsProcessed} requirements`);

  // Step 2: Assessment Seed
  console.log('\n[2/5] Seeding Assessment Data (Assessments & Question Banks)...');
  const assessment = await seedAssessmentData();
  console.log(`  ✓ Processed ${assessment.assessmentsProcessed} assessments, ${assessment.questionsProcessed} questions across ${assessment.skillsCoveredCount} skills`);

  // Step 3: Resource Seed
  console.log('\n[3/5] Seeding Learning Resources Catalog...');
  const resources = await seedResourceData();
  console.log(`  ✓ Processed ${resources.resourcesProcessed} learning resources`);

  // Step 4: Project Seed
  console.log('\n[4/5] Seeding Practical Portfolio Projects Catalog...');
  const projects = await seedProjectData();
  console.log(`  ✓ Processed ${projects.projectsProcessed} portfolio projects`);

  // Step 5: Demo Student Persona
  console.log('\n[5/5] Seeding Demo Student Persona & End-to-End Walkthrough Data...');
  const demoStudent = await seedDemoStudentData();
  console.log(`  ✓ Demo Student setup complete (User ID: ${demoStudent.userId}, Roadmap ID: ${demoStudent.roadmapId})`);

  console.log('\n========================================');
  console.log('  Master Seed Process Completed Successfully!');
  console.log('========================================\n');

  return {
    foundation,
    assessment,
    resources,
    projects,
    demoStudent,
  };
};

// Executable CLI runner
if (typeof require !== 'undefined' && require.main === module) {
  connectDB()
    .then(async () => {
      await seedMaster();
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Master Seed Process Failed:', err);
      process.exit(1);
    });
}
