interface CaseStudyPattern {
  category: string;
  sections: {
    processTitle: string;
    keyFeaturesTitle: string;
    technicalTitle: string;
    additionalTitle: string;
  };
  commonTags: string[];
  processPoints: string[];
  technicalPoints: string[];
  resultMetrics: string[];
}

export const caseStudyPatterns: Record<string, CaseStudyPattern> = {
  branding: {
    category: "Branding",
    sections: {
      processTitle: "Brand Strategy",
      keyFeaturesTitle: "Design Elements",
      technicalTitle: "Implementation",
      additionalTitle: "Brand Applications",
    },
    commonTags: ["Branding", "Visual Identity", "Logo Design", "Brand Strategy"],
    processPoints: [
      "Market research and positioning",
      "Target audience analysis",
      "Brand story development",
      "Visual identity creation",
      "Digital presence planning",
      "Marketing collateral design"
    ],
    technicalPoints: [
      "Brand guidelines documentation",
      "Marketing collateral design",
      "Digital presence optimization",
      "Signage and environmental graphics",
      "Social media templates",
      "Print materials suite"
    ],
    resultMetrics: [
      "% increase in brand recognition",
      "Successful market expansion",
      "Enhanced digital presence",
      "Improved client acquisition",
      "Industry design awards",
      "Strengthened market position"
    ]
  },
  productDesign: {
    category: "Product Design",
    sections: {
      processTitle: "Design Process",
      keyFeaturesTitle: "Product Features",
      technicalTitle: "Technical Details",
      additionalTitle: "Sustainability Focus",
    },
    commonTags: ["Product Design", "Manufacturing", "Sustainability", "Innovation"],
    processPoints: [
      "Material research and selection",
      "Ergonomic studies",
      "Prototype development",
      "User testing",
      "Production optimization",
      "Quality assurance"
    ],
    technicalPoints: [
      "Material specifications",
      "Production techniques",
      "Quality control measures",
      "Safety certifications",
      "Packaging design",
      "Assembly instructions"
    ],
    resultMetrics: [
      "Units sold in first quarter",
      "Customer satisfaction rate",
      "Industry recognition",
      "Retail partnerships",
      "Market expansion",
      "Sustainability achievements"
    ]
  },
  webDesign: {
    category: "Web Design",
    sections: {
      processTitle: "Design Process",
      keyFeaturesTitle: "Website Features",
      technicalTitle: "Technical Stack",
      additionalTitle: "Performance Metrics",
    },
    commonTags: ["Web Design", "UX/UI", "Development", "Digital Strategy"],
    processPoints: [
      "User research and analysis",
      "Information architecture",
      "Wireframing and prototyping",
      "Visual design",
      "Development and testing",
      "Performance optimization"
    ],
    technicalPoints: [
      "Frontend framework implementation",
      "Backend system architecture",
      "Database design",
      "API integration",
      "Security measures",
      "Performance optimization"
    ],
    resultMetrics: [
      "Increase in conversion rate",
      "Improved page load time",
      "Higher user engagement",
      "Mobile traffic growth",
      "Reduced bounce rate",
      "SEO ranking improvements"
    ]
  },
  videoProduction: {
    category: "Video Production",
    sections: {
      processTitle: "Production Approach",
      keyFeaturesTitle: "Creative Elements",
      technicalTitle: "Technical Execution",
      additionalTitle: "Post-Production",
    },
    commonTags: ["Video Production", "Motion Graphics", "Storytelling", "Cinematography"],
    processPoints: [
      "Concept development",
      "Storyboard creation",
      "Location scouting",
      "Talent coordination",
      "Equipment planning",
      "Production scheduling"
    ],
    technicalPoints: [
      "Camera and lens selection",
      "Lighting setup",
      "Audio recording",
      "Motion control",
      "Special effects",
      "Color grading"
    ],
    resultMetrics: [
      "View count achievement",
      "Engagement metrics",
      "Social media impact",
      "Brand awareness increase",
      "Lead generation",
      "ROI measurements"
    ]
  },
  editorialDesign: {
    category: "Editorial Design",
    sections: {
      processTitle: "Design Strategy",
      keyFeaturesTitle: "Design Elements",
      technicalTitle: "Technical Details",
      additionalTitle: "Creative Solutions",
    },
    commonTags: ["Editorial Design", "Typography", "Layout Design", "Print Design"],
    processPoints: [
      "Content strategy",
      "Typography selection",
      "Grid system development",
      "Visual hierarchy",
      "Image curation",
      "Print optimization"
    ],
    technicalPoints: [
      "Print specifications",
      "Color management",
      "Typography system",
      "Production workflow",
      "Quality control",
      "File preparation"
    ],
    resultMetrics: [
      "Circulation growth",
      "Reader engagement",
      "Design awards",
      "Advertiser satisfaction",
      "Market expansion",
      "Brand recognition"
    ]
  }
}; 