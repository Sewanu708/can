export type LoginResponse = {
    access_token:string
    token_type:string
    user:Record<string,string>
}
export type RegisterResponse = {
    name:string
    id:number
    email:string
}

export type DrillLog = {
  id: string;
  submitted_at: string;
  mode: string;
  score: number;
  total_questions: number;
  total_time_spent: number;
}

export type Question = {
  id: number;
  drill_type: string;
  difficulty_level: string;
  question_text: string;
  correct_answer: string;
  category: string;
  drill_metadata: any;
  options: string[];
  tags: string | null;
};

export type AttemptDetailPayload = {
  question_id: number;
  selected_answer: string;
  time_taken: number;
};

export type DrillAttemptPayload = {
  score: number;
  mode: string;
  total_time_spent: number;
  total_questions: number;
  details: AttemptDetailPayload[];
};

export type DrillAttemptResponse = {
  id: number;
  user_id: number;
  score: number;
  total_questions: number;
  total_time_spent: number;
  submitted_at: string;
  mode: string;
};





