/**
 * Demo Assessment Questions & Results
 * -------------------------------------
 * Matches the AssessmentQuestion and AssessmentResult interfaces from @/types/assessment.types.
 * Used by: AssessmentPage, AssessmentResultsPage.
 *
 * TO SWAP WITH REAL DATA: assessmentApi.getQuestions() returns AssessmentQuestion[].
 * TO SWAP WITH REAL DATA: assessmentApi.getLatestResult() returns AssessmentResult.
 */

import type { AssessmentQuestion, AssessmentResult } from '@/types/assessment.types'

/**
 * 15 diagnostic questions covering core frontend engineering competencies.
 * Mix of conceptual, practical, and code-reading questions.
 */
export const DEMO_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q_html_01',
    category: 'HTML & CSS',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    text: 'Which HTML5 element should be used to mark the main navigational links of a page?',
    correctOptionId: 'q_html_01_b',
    explanation: 'The <nav> element represents a section of a page that links to other pages or to parts within the page.',
    options: [
      { id: 'q_html_01_a', text: '<div id="nav">' },
      { id: 'q_html_01_b', text: '<nav>' },
      { id: 'q_html_01_c', text: '<menu>' },
      { id: 'q_html_01_d', text: '<links>' },
    ],
  },
  {
    id: 'q_css_01',
    category: 'HTML & CSS',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    text: 'In CSS Flexbox, which property controls the alignment of items along the cross axis?',
    correctOptionId: 'q_css_01_b',
    explanation: 'align-items sets the align-self value on all direct children as a group along the cross axis.',
    options: [
      { id: 'q_css_01_a', text: 'justify-content' },
      { id: 'q_css_01_b', text: 'align-items' },
      { id: 'q_css_01_c', text: 'flex-direction' },
      { id: 'q_css_01_d', text: 'flex-wrap' },
    ],
  },
  {
    id: 'q_css_02',
    category: 'HTML & CSS',
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    text: 'What does the CSS property `box-sizing: border-box` do?',
    correctOptionId: 'q_css_02_b',
    explanation: 'border-box tells the browser to account for any border and padding in the values you specify for an element\'s width and height.',
    options: [
      { id: 'q_css_02_a', text: 'Adds a visible border to all elements' },
      { id: 'q_css_02_b', text: 'Includes padding and border in the element\'s total width and height' },
      { id: 'q_css_02_c', text: 'Removes default browser margin from all elements' },
      { id: 'q_css_02_d', text: 'Sets the element\'s display to block' },
    ],
  },
  {
    id: 'q_js_01',
    category: 'JavaScript',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    text: 'What will the following code log to the console?\n\nconsole.log(typeof null)',
    codeSnippet: 'console.log(typeof null)',
    correctOptionId: 'q_js_01_c',
    explanation: 'In JavaScript, typeof null returns "object" due to a historical legacy bug in JS type tagging.',
    options: [
      { id: 'q_js_01_a', text: '"null"' },
      { id: 'q_js_01_b', text: '"undefined"' },
      { id: 'q_js_01_c', text: '"object"' },
      { id: 'q_js_01_d', text: '"string"' },
    ],
  },
  {
    id: 'q_js_02',
    category: 'JavaScript',
    difficulty: 'MEDIUM',
    type: 'CODE_SNIPPET',
    text: 'What is the output of the following code?',
    codeSnippet: `const arr = [1, 2, 3]
const result = arr.map(x => x * 2).filter(x => x > 3)
console.log(result)`,
    correctOptionId: 'q_js_02_b',
    explanation: 'arr.map produces [2, 4, 6], and filter(x => x > 3) retains only [4, 6].',
    options: [
      { id: 'q_js_02_a', text: '[2, 4, 6]' },
      { id: 'q_js_02_b', text: '[4, 6]' },
      { id: 'q_js_02_c', text: '[6]' },
      { id: 'q_js_02_d', text: '[2, 6]' },
    ],
  },
  {
    id: 'q_js_03',
    category: 'JavaScript',
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    text: 'Which statement correctly describes a JavaScript closure?',
    correctOptionId: 'q_js_03_b',
    explanation: 'A closure is the combination of a function bundled together with references to its lexical environment.',
    options: [
      { id: 'q_js_03_a', text: 'A function that cannot be called more than once' },
      { id: 'q_js_03_b', text: 'A function that retains access to its outer scope variables even after the outer function has returned' },
      { id: 'q_js_03_c', text: 'A function with no return statement' },
      { id: 'q_js_03_d', text: 'A built-in browser API for managing state' },
    ],
  },
  {
    id: 'q_js_04',
    category: 'JavaScript',
    difficulty: 'HARD',
    type: 'CODE_SNIPPET',
    text: 'What does the following async function return when awaited?',
    codeSnippet: `async function fetchData() {
  const result = await Promise.resolve(42)
  return result * 2
}

const value = await fetchData()
console.log(value)`,
    correctOptionId: 'q_js_04_c',
    explanation: 'Promise.resolve(42) resolves to 42, which is multiplied by 2 to return 84.',
    options: [
      { id: 'q_js_04_a', text: '42' },
      { id: 'q_js_04_b', text: 'Promise { 84 }' },
      { id: 'q_js_04_c', text: '84' },
      { id: 'q_js_04_d', text: 'undefined' },
    ],
  },
  {
    id: 'q_react_01',
    category: 'React',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    text: 'In React, what is the correct way to update state from a user input event?',
    correctOptionId: 'q_react_01_b',
    explanation: 'State should be updated using the setter function returned by useState or this.setState in class components.',
    options: [
      { id: 'q_react_01_a', text: 'this.state.value = e.target.value' },
      { id: 'q_react_01_b', text: 'setValue(e.target.value)' },
      { id: 'q_react_01_c', text: 'state.value = e.target.value' },
      { id: 'q_react_01_d', text: 'React.setState(e.target.value)' },
    ],
  },
  {
    id: 'q_react_02',
    category: 'React',
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    text: 'When does the `useEffect` hook with an empty dependency array `[]` execute?',
    correctOptionId: 'q_react_02_b',
    explanation: 'An empty dependency array causes the effect to run only once after the component mounts into the DOM.',
    options: [
      { id: 'q_react_02_a', text: 'On every re-render' },
      { id: 'q_react_02_b', text: 'Only once, after the initial render' },
      { id: 'q_react_02_c', text: 'Only when state changes' },
      { id: 'q_react_02_d', text: 'Before the component mounts' },
    ],
  },
  {
    id: 'q_react_03',
    category: 'React',
    difficulty: 'HARD',
    type: 'SCENARIO',
    text: 'Your component re-renders excessively when a parent state changes but the child\'s props haven\'t changed. What is the BEST solution?',
    correctOptionId: 'q_react_03_a',
    explanation: 'React.memo() wraps a functional component to prevent re-renders when its props have not changed.',
    options: [
      { id: 'q_react_03_a', text: 'Wrap the child component with React.memo()' },
      { id: 'q_react_03_b', text: 'Convert the child to a class component' },
      { id: 'q_react_03_c', text: 'Add all state to a global Redux store' },
      { id: 'q_react_03_d', text: 'Use componentShouldUpdate lifecycle method' },
    ],
  },
  {
    id: 'q_git_01',
    category: 'Tools & Version Control',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    text: 'Which Git command creates a new branch AND switches to it in one step?',
    correctOptionId: 'q_git_01_b',
    explanation: 'git checkout -b <branch> (or git switch -c <branch>) creates a new branch and checks it out simultaneously.',
    options: [
      { id: 'q_git_01_a', text: 'git branch new-feature' },
      { id: 'q_git_01_b', text: 'git checkout -b new-feature' },
      { id: 'q_git_01_c', text: 'git create new-feature' },
      { id: 'q_git_01_d', text: 'git switch new-feature' },
    ],
  },
  {
    id: 'q_git_02',
    category: 'Tools & Version Control',
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    text: 'What is the purpose of `git stash`?',
    correctOptionId: 'q_git_02_b',
    explanation: 'git stash temporarily shelves changes you\'ve made to your working copy so you can work on something else.',
    options: [
      { id: 'q_git_02_a', text: 'Permanently deletes uncommitted changes' },
      { id: 'q_git_02_b', text: 'Temporarily saves changes that are not ready to be committed' },
      { id: 'q_git_02_c', text: 'Merges two branches together' },
      { id: 'q_git_02_d', text: 'Reverts the last commit' },
    ],
  },
  {
    id: 'q_algo_01',
    category: 'Problem Solving',
    difficulty: 'MEDIUM',
    type: 'CODE_SNIPPET',
    text: 'What is the time complexity of the following function?',
    codeSnippet: `function findDuplicate(arr) {
  const seen = new Set()
  for (const item of arr) {
    if (seen.has(item)) return item
    seen.add(item)
  }
  return null
}`,
    correctOptionId: 'q_algo_01_c',
    explanation: 'A single loop over an array of n items with O(1) Set operations yields linear O(n) time complexity.',
    options: [
      { id: 'q_algo_01_a', text: 'O(n²)' },
      { id: 'q_algo_01_b', text: 'O(n log n)' },
      { id: 'q_algo_01_c', text: 'O(n)' },
      { id: 'q_algo_01_d', text: 'O(1)' },
    ],
  },
  {
    id: 'q_web_01',
    category: 'Programming Fundamentals',
    difficulty: 'EASY',
    type: 'MULTIPLE_CHOICE',
    text: 'Which HTTP status code indicates a successful GET request?',
    correctOptionId: 'q_web_01_c',
    explanation: 'HTTP status 200 OK is the standard response for successful HTTP requests.',
    options: [
      { id: 'q_web_01_a', text: '201 Created' },
      { id: 'q_web_01_b', text: '404 Not Found' },
      { id: 'q_web_01_c', text: '200 OK' },
      { id: 'q_web_01_d', text: '500 Internal Server Error' },
    ],
  },
  {
    id: 'q_web_02',
    category: 'Programming Fundamentals',
    difficulty: 'MEDIUM',
    type: 'MULTIPLE_CHOICE',
    text: 'What is the difference between `localStorage` and `sessionStorage` in the browser?',
    correctOptionId: 'q_web_02_c',
    explanation: 'localStorage persists until explicitly deleted by user or app, whereas sessionStorage is tied to page session lifetime.',
    options: [
      { id: 'q_web_02_a', text: 'localStorage is limited to 5KB; sessionStorage has no limit' },
      { id: 'q_web_02_b', text: 'sessionStorage persists data across browser sessions; localStorage does not' },
      { id: 'q_web_02_c', text: 'localStorage persists data until explicitly cleared; sessionStorage is cleared when the tab is closed' },
      { id: 'q_web_02_d', text: 'There is no difference — they are both identical' },
    ],
  },
]

/**
 * Sample assessment result shown on the AssessmentResultsPage when no real result exists.
 * This reflects a realistic performance after completing a diagnostic.
 */
export const DEMO_ASSESSMENT_RESULT: AssessmentResult = {
  id: 'result_demo_001',
  assessmentId: 'diag_assessment',
  title: 'Frontend Developer Diagnostic',
  category: 'Frontend Development',
  completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  score: 72,
  totalQuestions: 15,
  correctQuestions: 11,
  evaluatedSkills: [
    { skillName: 'HTML & CSS', demonstratedLevel: 4, delta: 0 },
    { skillName: 'JavaScript', demonstratedLevel: 3, delta: 1 },
    { skillName: 'React', demonstratedLevel: 2, delta: 0 },
    { skillName: 'Git & Version Control', demonstratedLevel: 3, delta: 1 },
    { skillName: 'Problem Solving', demonstratedLevel: 2, delta: -1 },
  ],
  identifiedGaps: [
    'React hooks & component lifecycle',
    'Async JavaScript (Promises, async/await)',
    'Algorithm complexity analysis',
  ],
  recommendedRoadmapSteps: [
    'Complete Stage 3: Git & Professional Workflow (currently In Progress)',
    'Begin Stage 4: React & Component Architecture next',
    'Supplement with daily JavaScript practice on javascript.info',
  ],
}
