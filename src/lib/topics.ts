export interface Topic {
  slug: string;
  label: string;
  searchTerm: string;
}

export const TOPICS: Topic[] = [
  { slug: "cardiologia", label: "Cardiología", searchTerm: "cardiology[MeSH Terms] OR heart disease[MeSH Terms]" },
  { slug: "neumologia", label: "Neumología", searchTerm: "pulmonology[MeSH Terms] OR lung disease[MeSH Terms] OR respiratory tract diseases[MeSH Terms]" },
  { slug: "endocrinologia", label: "Endocrinología", searchTerm: "endocrinology[MeSH Terms] OR endocrine diseases[MeSH Terms]" },
  { slug: "enfermeria", label: "Enfermería", searchTerm: "nursing[MeSH Terms] OR nursing education[MeSH Terms]" },
  { slug: "tratamientos-experimentales", label: "Tratamientos experimentales", searchTerm: "experimental therapy[MeSH Terms] OR clinical trial[Publication Type]" },
  { slug: "oncologia", label: "Oncología", searchTerm: "oncology[MeSH Terms] OR neoplasms[MeSH Terms]" },
  { slug: "cirugia-vascular", label: "Cirugía vascular", searchTerm: "vascular surgery[MeSH Terms] OR vascular diseases[MeSH Terms]" },
  { slug: "neurologia", label: "Neurología", searchTerm: "neurology[MeSH Terms] OR nervous system diseases[MeSH Terms]" },
  { slug: "cirugia-general", label: "Cirugía general", searchTerm: "general surgery[MeSH Terms] OR surgical procedures[MeSH Terms]" },
  { slug: "aparato-digestivo", label: "Aparato digestivo", searchTerm: "gastroenterology[MeSH Terms] OR digestive system diseases[MeSH Terms]" },
  { slug: "neurocirugia", label: "Neurocirugía", searchTerm: "neurosurgery[MeSH Terms]" },
  { slug: "urgencias-emergencias", label: "Urgencias y emergencias", searchTerm: "emergency medicine[MeSH Terms] OR emergency treatment[MeSH Terms]" },
  { slug: "medicina-intensiva", label: "Medicina intensiva", searchTerm: "intensive care[MeSH Terms] OR critical care[MeSH Terms]" },
  { slug: "psicologia", label: "Psicología", searchTerm: "psychology[MeSH Terms] OR mental health[MeSH Terms]" },
  { slug: "psiquiatria", label: "Psiquiatría", searchTerm: "psychiatry[MeSH Terms] OR mental disorders[MeSH Terms]" },
  { slug: "obstetricia-ginecologia", label: "Obstetricia y ginecología", searchTerm: "obstetrics[MeSH Terms] OR gynecology[MeSH Terms]" },
  { slug: "traumatologia", label: "Traumatología", searchTerm: "traumatology[MeSH Terms] OR wounds and injuries[MeSH Terms]" },
  { slug: "nefrologia", label: "Nefrología", searchTerm: "nephrology[MeSH Terms] OR kidney diseases[MeSH Terms]" },
  { slug: "hematologia", label: "Hematología", searchTerm: "hematology[MeSH Terms] OR blood diseases[MeSH Terms]" },
  { slug: "pediatria", label: "Pediatría", searchTerm: "pediatrics[MeSH Terms] OR child health[MeSH Terms]" },
  { slug: "microbiologia", label: "Microbiología", searchTerm: "microbiology[MeSH Terms] OR bacteria[MeSH Terms]" },
  { slug: "medicina-interna", label: "Medicina Interna", searchTerm: "internal medicine[MeSH Terms]" },
  { slug: "medicina-preventiva", label: "Medicina Preventiva", searchTerm: "preventive medicine[MeSH Terms] OR public health[MeSH Terms]" },
  { slug: "atencion-primaria", label: "Atención Primaria", searchTerm: "primary health care[MeSH Terms] OR family practice[MeSH Terms]" },
  { slug: "enfermedades-infecciosas", label: "Enfermedades infecciosas", searchTerm: "communicable diseases[MeSH Terms] OR infectious disease medicine[MeSH Terms]" },
];

export function getTopicByslug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export function getRandomTopicSlug(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)].slug;
}
