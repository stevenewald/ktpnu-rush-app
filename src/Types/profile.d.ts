declare type ProfileType = {
  fullName: string;
  hometown: string;
  gender: string;
  grade: string;
  major: string;
  gpa: string;
  linkedinURL: string;
  techInterest: string;
  whyKTP: string;
  scientificBreakthrough: string;
  brandCompany: string;
  passion: string;
  funFact: string;
  email?: string;
  PfpURL?: string;
  ResumeURL?: string;
  completed_application?: boolean;
  selected_cc_timeslot?: boolean;
  selected_social_timeslot?: boolean;
  selected_gi_timeslot?: boolean;
  admin?: boolean;
  readonly?: boolean;
  dropped?: boolean;
  flagged?: boolean;
  stage?: number;
  cs?: boolean;
  selected_indiv_timeslot?: string;
};
