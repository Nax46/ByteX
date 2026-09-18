import { connectDB, disconnectDB } from '../config/database.js';
import { SkillModel } from '../models/Skill.js';
import { CareerModel } from '../models/Career.js';
import { CareerSkillModel } from '../models/CareerSkill.js';
import { SkillCategory, SkillImportance } from '../types/intelligence.js';

export interface SeedResult {
  skillsProcessed: number;
  careersProcessed: number;
  careerSkillsProcessed: number;
}

export const seedFoundationData = async (): Promise<SeedResult> => {
  // 1. Skill Definitions
  const skillsData: Array<{ name: string; slug: string; category: SkillCategory; description: string }> = [
    { name: 'JavaScript', slug: 'javascript', category: 'TECHNICAL', description: 'Core programming language of the web' },
    { name: 'React', slug: 'react', category: 'FRAMEWORK', description: 'Frontend component library for building user interfaces' },
    { name: 'Node.js', slug: 'node-js', category: 'TECHNICAL', description: 'Server-side JavaScript runtime environment' },
    { name: 'Express', slug: 'express', category: 'FRAMEWORK', description: 'Minimalist web framework for Node.js' },
    { name: 'MongoDB', slug: 'mongodb', category: 'TOOL', description: 'NoSQL document database' },
    { name: 'REST API', slug: 'rest-api', category: 'CORE_CS', description: 'Representational State Transfer API architecture' },
    { name: 'Git', slug: 'git', category: 'TOOL', description: 'Distributed version control system' },
    { name: 'Authentication', slug: 'authentication', category: 'CORE_CS', description: 'Identity verification and authorization patterns' },
    { name: 'Problem Solving', slug: 'problem-solving', category: 'SOFT', description: 'Analytical thinking and algorithmic problem solving' },
  ];

  // Idempotent Skill Upserts
  const skillDocsMap = new Map<string, any>();
  for (const skill of skillsData) {
    const doc = await SkillModel.findOneAndUpdate(
      { slug: skill.slug },
      { $set: skill },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    skillDocsMap.set(skill.slug, doc);
  }

  // 2. Career Definition
  const careerData = {
    title: 'Full Stack Developer',
    slug: 'full-stack-developer',
    description: 'Designs and builds modern end-to-end web applications combining frontend UIs, backend APIs, and databases.',
    category: 'Web Development',
    isActive: true,
  };

  const careerDoc = await CareerModel.findOneAndUpdate(
    { slug: careerData.slug },
    { $set: careerData },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  // 3. CareerSkill Requirement Mappings
  const mappings: Array<{
    skillSlug: string;
    requiredLevel: number;
    importance: SkillImportance;
    prerequisiteSlugs: string[];
  }> = [
    { skillSlug: 'javascript', requiredLevel: 85, importance: 'CRITICAL', prerequisiteSlugs: [] },
    { skillSlug: 'react', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: ['javascript'] },
    { skillSlug: 'node-js', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['javascript'] },
    { skillSlug: 'express', requiredLevel: 75, importance: 'HIGH', prerequisiteSlugs: ['node-js'] },
    { skillSlug: 'rest-api', requiredLevel: 80, importance: 'CRITICAL', prerequisiteSlugs: ['express'] },
    { skillSlug: 'mongodb', requiredLevel: 70, importance: 'HIGH', prerequisiteSlugs: ['express'] },
    { skillSlug: 'authentication', requiredLevel: 70, importance: 'CRITICAL', prerequisiteSlugs: ['express', 'rest-api'] },
    { skillSlug: 'git', requiredLevel: 75, importance: 'MEDIUM', prerequisiteSlugs: [] },
    { skillSlug: 'problem-solving', requiredLevel: 80, importance: 'HIGH', prerequisiteSlugs: [] },
  ];

  let careerSkillsCount = 0;
  for (const mapping of mappings) {
    const skillDoc = skillDocsMap.get(mapping.skillSlug);
    if (!skillDoc) continue;

    const prereqIds = mapping.prerequisiteSlugs
      .map((slug) => skillDocsMap.get(slug)?._id)
      .filter((id) => Boolean(id));

    await CareerSkillModel.findOneAndUpdate(
      { careerId: careerDoc._id, skillId: skillDoc._id },
      {
        $set: {
          careerId: careerDoc._id,
          skillId: skillDoc._id,
          requiredLevel: mapping.requiredLevel,
          importance: mapping.importance,
          weight: 1.0,
          prerequisites: prereqIds,
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    careerSkillsCount++;
  }

  return {
    skillsProcessed: skillDocsMap.size,
    careersProcessed: 1,
    careerSkillsProcessed: careerSkillsCount,
  };
};

// Executable runner when called directly via CLI
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  connectDB()
    .then(async () => {
      console.log('Running foundation seed script...');
      const result = await seedFoundationData();
      console.log('Seed executed successfully:', result);
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Foundation seed failed:', err);
      process.exit(1);
    });
}
