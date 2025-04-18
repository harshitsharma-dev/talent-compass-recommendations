
export interface Assessment {
  id: string;
  title: string;
  url: string;
  remote_support: boolean;
  adaptive_support: boolean;
  test_type: string[];
  description: string;
  job_levels: string[];
  languages: string[];
  assessment_length: number;
  duration?: number; // Added optional duration property
  downloads: number;
}

export const assessments: Assessment[] = [
  {
    id: "1",
    title: "Java Developer Assessment Pack",
    url: "https://example.com/assessments/java-dev",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Coding", "Technical Knowledge"],
    description: "Comprehensive Java developer assessment that tests both coding skills and theoretical knowledge. Includes Spring framework fundamentals, API design, and enterprise patterns.",
    job_levels: ["Mid-level", "Senior"],
    languages: ["English", "Spanish"],
    assessment_length: 55,
    downloads: 4350
  },
  {
    id: "2",
    title: "Frontend Web Development Test",
    url: "https://example.com/assessments/frontend-web",
    remote_support: true,
    adaptive_support: false,
    test_type: ["Coding", "Design"],
    description: "Assessment for frontend developers focusing on HTML, CSS, JavaScript, and modern frameworks. Includes real-world UI implementation challenges.",
    job_levels: ["Junior", "Mid-level", "Senior"],
    languages: ["English", "German"],
    assessment_length: 45,
    downloads: 8750
  },
  {
    id: "3",
    title: "DevOps Engineer Technical Assessment",
    url: "https://example.com/assessments/devops",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Technical Knowledge", "Scenario-Based"],
    description: "Comprehensive DevOps assessment covering CI/CD, containerization, infrastructure as code, and cloud platforms including AWS, Azure, and GCP.",
    job_levels: ["Mid-level", "Senior"],
    languages: ["English"],
    assessment_length: 60,
    downloads: 3200
  },
  {
    id: "4",
    title: "Product Manager Skills Assessment",
    url: "https://example.com/assessments/product-manager",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Case Study", "Personality", "Scenario-Based"],
    description: "Evaluates product management capabilities including stakeholder management, prioritization, product strategy, and market analysis.",
    job_levels: ["Mid-level", "Senior", "Leadership"],
    languages: ["English", "French", "German"],
    assessment_length: 75,
    downloads: 5680
  },
  {
    id: "5",
    title: "Data Science Comprehensive Test",
    url: "https://example.com/assessments/data-science",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Coding", "Technical Knowledge", "Problem Solving"],
    description: "Data science assessment covering statistical analysis, machine learning, data visualization, and big data technologies.",
    job_levels: ["Mid-level", "Senior"],
    languages: ["English"],
    assessment_length: 90,
    downloads: 6340
  },
  {
    id: "6",
    title: "UX/UI Designer Portfolio Review",
    url: "https://example.com/assessments/ux-ui",
    remote_support: true,
    adaptive_support: false,
    test_type: ["Design", "Case Study"],
    description: "Design skills assessment focusing on user experience principles, interface design, wireframing, and design thinking methodologies.",
    job_levels: ["Junior", "Mid-level", "Senior"],
    languages: ["English", "Spanish", "French"],
    assessment_length: 45,
    downloads: 4920
  },
  {
    id: "7",
    title: "QA Automation Engineer Test",
    url: "https://example.com/assessments/qa-automation",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Coding", "Technical Knowledge"],
    description: "Assessment for QA engineers focusing on test automation frameworks, API testing, performance testing, and quality processes.",
    job_levels: ["Mid-level", "Senior"],
    languages: ["English", "German"],
    assessment_length: 50,
    downloads: 3890
  },
  {
    id: "8",
    title: "Sales Executive Skills Assessment",
    url: "https://example.com/assessments/sales-exec",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Personality", "Scenario-Based", "Role Play"],
    description: "Evaluates sales capabilities including prospecting, negotiation, closing techniques, and relationship management.",
    job_levels: ["Mid-level", "Senior", "Leadership"],
    languages: ["English", "Spanish", "French", "German"],
    assessment_length: 60,
    downloads: 7520
  },
  {
    id: "9",
    title: "Cybersecurity Analyst Technical Assessment",
    url: "https://example.com/assessments/security",
    remote_support: true,
    adaptive_support: true,
    test_type: ["Technical Knowledge", "Scenario-Based", "Problem Solving"],
    description: "Comprehensive security assessment covering threat detection, vulnerability assessment, incident response, and security frameworks.",
    job_levels: ["Mid-level", "Senior"],
    languages: ["English"],
    assessment_length: 80,
    downloads: 4150
  },
  {
    id: "10",
    title: "Project Manager Competency Assessment",
    url: "https://example.com/assessments/project-manager",
    remote_support: true,
    adaptive_support: false,
    test_type: ["Case Study", "Personality", "Scenario-Based"],
    description: "Evaluates project management skills including planning, risk management, team leadership, and stakeholder communication.",
    job_levels: ["Mid-level", "Senior", "Leadership"],
    languages: ["English", "Spanish", "French"],
    assessment_length: 65,
    downloads: 8920
  }
];

export const exampleQueries = [
  {
    id: "ex1",
    title: "Senior Java Developer",
    description: "Looking for a senior Java developer with Spring Boot experience for a financial services company. Must have experience with microservices architecture and cloud deployment.",
  },
  {
    id: "ex2",
    title: "UX/UI Designer",
    description: "Seeking a UX/UI designer with 3+ years of experience for an e-commerce company. Must have a strong portfolio showing user-centered design approaches.",
  },
  {
    id: "ex3",
    title: "DevOps Engineer",
    description: "Need to assess DevOps engineers with strong CI/CD pipeline experience and knowledge of AWS or Azure cloud services.",
  },
  {
    id: "ex4",
    title: "Product Manager",
    description: "Hiring a product manager for our SaaS platform. Looking for someone with technical background and experience leading cross-functional teams.",
  }
];
