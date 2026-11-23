export type ProgramLevel = "undergraduate" | "graduate" | "certificate" | "minor";

export type ProgramEntry = {
  name: string;
  href: string;
  level: ProgramLevel;
  field: string;
};

export const PROGRAMS: ProgramEntry[] = [
  {
    name: "Artificial Intelligence (BS)",
    href: "/programs-admission/undergraduate-programs/artificial-intelligence-bs",
    level: "undergraduate",
    field: "Artificial intelligence",
  },
  {
    name: "Biomedical Engineering (BBE)",
    href: "/programs-admission/undergraduate-programs/biomedical-engineering-bbe",
    level: "undergraduate",
    field: "Biomedical",
  },
  {
    name: "Chemical Physics (BS)",
    href: "/programs-admission/undergraduate-programs/chemical-physics-bs",
    level: "undergraduate",
    field: "Chemical physics",
  },
  {
    name: "Civil Engineering (BCE)",
    href: "/programs-admission/undergraduate-programs/civil-engineering-bce",
    level: "undergraduate",
    field: "Civil",
  },
  {
    name: "Computer Science (BS)",
    href: "/programs-admission/undergraduate-programs/computer-science-bs",
    level: "undergraduate",
    field: "Computer science",
  },
  {
    name: "Electrical and Computer Engineering (BECE)",
    href: "/programs-admission/undergraduate-programs/electrical-and-computer-engineering-bece",
    level: "undergraduate",
    field: "Electrical and computer",
  },
  {
    name: "Environmental Engineering (BS)",
    href: "/programs-admission/undergraduate-programs/environmental-engineering-bs",
    level: "undergraduate",
    field: "Environmental",
  },
  {
    name: "Mechanical Engineering (BME)",
    href: "/programs-admission/undergraduate-programs/mechanical-engineering-bme",
    level: "undergraduate",
    field: "Mechanical",
  },
  {
    name: "Physics (BS)",
    href: "/programs-admission/undergraduate-programs/physics-bs",
    level: "undergraduate",
    field: "Physics",
  },
  {
    name: "Civil Engineering (MS)",
    href: "/programs-admission/graduate-programs/civil-engineering-ms",
    level: "graduate",
    field: "Civil",
  },
  {
    name: "Data Analytics (MS)",
    href: "/programs-admission/graduate-programs/data-analytics-ms",
    level: "graduate",
    field: "Data",
  },
  {
    name: "Artificial Intelligence (MS)",
    href: "/programs-admission/graduate-programs/artificial-intelligence-ms",
    level: "graduate",
    field: "Artificial intelligence",
  },
  {
    name: "Engineering Management Certificate",
    href: "/programs-admission/certificate-programs/engineering-management-professional-certificate",
    level: "certificate",
    field: "Management",
  },
  {
    name: "Minors",
    href: "/programs-admission/undergraduate-programs/minors",
    level: "minor",
    field: "Any",
  },
];

export const FIELDS = [
  "Any",
  "Artificial intelligence",
  "Biomedical",
  "Chemical physics",
  "Civil",
  "Computer science",
  "Electrical and computer",
  "Environmental",
  "Mechanical",
  "Physics",
  "Data",
  "Management",
] as const;