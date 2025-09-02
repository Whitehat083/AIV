

import { GoogleGenAI, Type } from "@google/genai";
import { Appointment, Goal, Habit, HabitLog, Mood, MoodLog, Task, RoutinePreferences, RoutineItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export interface AiAgendaResponse {
  schedule: RoutineItem[];
  highlights: Array<{startTime: string; endTime: string; reason: string}>;
  proactiveSuggestion: { text: string };
}

export const generateAgendaSuggestions = async (
    appointments: Appointment[],
    tasks: Task[],
    habits: Habit[],
    goals: Goal[],
): Promise<AiAgendaResponse> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY not set. Returning mock data for Agenda.");
        return {
            schedule: [
                { time: '10:00', title: 'Hábito: Meditar por 10 min', duration: 10, type: 'habit', icon: '🧘' },
                { time: '10:15', title: 'Pausa para café', duration: 15, type: 'break', icon: '☕' },
                { time: '15:00', title: 'Meta: Ler 1 capítulo', duration: 30, type: 'goal', icon: '📚' }
            ],
            highlights: [{ startTime: '14:00', endTime: '16:00', reason: 'Este é um bom momento para foco profundo, pois não há interrupções.' }],
            proactiveSuggestion: { text: 'Você tem 45 minutos livres às 16:30. Que tal avançar na tarefa "Preparar apresentação"?' }
        };
    }
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });

    const prompt = `
        Você é um assistente de produtividade de elite. Sua tarefa é analisar os dados de um usuário e criar sugestões inteligentes para a agenda do dia de hoje (${today}).

        **Contexto do Usuário:**
        1.  **Compromissos Fixos (Não podem ser movidos):**
            ${appointments.length > 0 ? JSON.stringify(appointments.map(a => ({ titulo: a.title, horario: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), duracao: a.duration }))) : "Nenhum compromisso fixo hoje."}
        2.  **Tarefas Pendentes (Para encaixar nos horários livres):**
            ${tasks.length > 0 ? JSON.stringify(tasks.map(t => ({ titulo: t.title, prioridade: t.priority }))) : "Nenhuma tarefa pendente."}
        3.  **Hábitos Diários (Para encaixar nos horários livres):**
            ${habits.length > 0 ? JSON.stringify(habits.map(h => h.name)) : "Nenhum hábito diário."}
        4.  **Metas Ativas (Considere alocar tempo para elas):**
            ${goals.length > 0 ? JSON.stringify(goals.map(g => g.name)) : "Nenhuma meta ativa."}

        **Sua Missão em 3 Partes:**
        1.  **schedule**: Crie um array de itens de agenda para os hábitos e pausas. Encaixe os hábitos diários e 1-3 pausas curtas (10-15 min) em horários livres, evitando conflitos com os compromissos fixos. Para cada item, forneça 'time', 'title', 'duration', 'type' ('habit', 'break' ou 'goal'), e um 'icon' (emoji).
        2.  **highlights**: Analise a agenda completa (compromissos + seu schedule). Identifique 1 ou 2 blocos de tempo (pelo menos 1h) que sejam ideais para trabalho focado. Retorne um array com 'startTime', 'endTime', e uma 'reason' curta.
        3.  **proactiveSuggestion**: Encontre um bloco de tempo livre de pelo menos 30 minutos e sugira proativamente uma ação específica para o usuário, como trabalhar em uma tarefa ou meta pendente. Retorne um objeto com a sugestão no campo 'text'.

        Responda **APENAS** com um objeto JSON válido, seguindo o schema fornecido.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        schedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING }, title: { type: Type.STRING },
                                    duration: { type: Type.NUMBER }, type: { type: Type.STRING },
                                    icon: { type: Type.STRING }
                                },
                                required: ["time", "title", "duration", "type", "icon"]
                            }
                        },
                        highlights: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { startTime: { type: Type.STRING }, endTime: { type: Type.STRING }, reason: { type: Type.STRING } },
                                required: ["startTime", "endTime", "reason"]
                            }
                        },
                        proactiveSuggestion: {
                            type: Type.OBJECT,
                            properties: { text: { type: Type.STRING } },
                            required: ["text"]
                        }
                    },
                    required: ["schedule", "highlights", "proactiveSuggestion"]
                }
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as AiAgendaResponse;

    } catch (error) {
        console.error("Error calling Gemini API for agenda suggestions:", error);
        throw new Error("Failed to generate agenda suggestions from AI.");
    }
};

export const generateMotivationalQuote = async (
  latestMood: MoodLog | null,
  habits: Habit[],
  goals: Goal[],
  habitLogs: HabitLog[],
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Lembre-se: cada passo, por menor que seja, te aproxima do seu objetivo.";
  }

  const moodContext = latestMood ? `O humor do usuário hoje é: ${latestMood.mood}.` : "O usuário ainda não registrou o humor hoje.";
  
  const goalsContext = goals.map(g => {
    const percentage = g.targetValue > 0 ? Math.round((g.currentProgress / g.targetValue) * 100) : 0;
    return `Meta '${g.name}' está ${percentage}% concluída.`;
  }).join(' ');

  const habitsContext = habits.map(h => {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = habitLogs.find(l => l.habitId === h.id && l.date === todayStr);
    return `Hábito '${h.name}' ${log ? 'foi progredido hoje' : 'ainda não foi feito hoje'}.`;
  }).join(' ');

  const prompt = `
    Você é um coach motivacional amigável e positivo. Crie uma frase motivacional curta (1-2 sentenças) para um usuário de um aplicativo de produtividade.
    A frase deve ser personalizada com base no contexto a seguir. Seja inspirador, empático e evite ser repetitivo.
    Contexto:
    1.  ${moodContext}
    2.  Progresso das metas: ${goalsContext || 'Nenhuma meta definida.'}
    3.  Progresso dos hábitos de hoje: ${habitsContext || 'Nenhum hábito definido.'}

    Responda apenas com a frase motivacional, sem introduções ou despedidas.
  `;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating motivational quote:", error);
    return "A jornada de mil milhas começa com um único passo. Você consegue!";
  }
};

export const getEmotionalInsights = async (moodLogs: MoodLog[]): Promise<string> => {
  if (!process.env.API_KEY || moodLogs.length < 3) {
    return "Continue registrando seu humor diariamente para receber insights personalizados sobre seus padrões emocionais.";
  }

  const prompt = `
    Você é um psicólogo e analista de bem-estar. Analise o seguinte JSON de registros de humor de um usuário.
    Identifique padrões interessantes, como dias da semana com humor consistentemente alto ou baixo, ou correlações entre anotações e o humor registrado.
    Fale diretamente com o usuário de forma amigável e empática.
    Forneça um insight curto e acionável (2-3 sentenças) que o usuário possa usar para melhorar seu bem-estar.
    Fale sobre os dados, não sobre conceitos genéricos.
    
    Dados de humor:
    ${JSON.stringify(moodLogs)}

    Responda apenas com o insight, em português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating emotional insights:", error);
    return "Parece que você tem registrado seu humor de forma consistente. Continue assim para descobrirmos mais sobre seus padrões emocionais juntos!";
  }
};

export const generateWeeklyChallenge = async (
  habits: Habit[],
  goals: Goal[],
  moodLogs: MoodLog[],
): Promise<{ habitId: string; description: string; target: number } | null> => {
  if (!process.env.API_KEY || habits.length === 0) {
    return null;
  }

  const habitsContext = habits.map(h => `Hábito: "${h.name}" (ID: ${h.id}, Categoria: ${h.category}, Frequência: ${h.frequency})`).join('\n');
  const goalsContext = goals.map(g => `Meta: "${g.name}" (Categoria: ${g.category})`).join('\n');
  const recentMoods = moodLogs.slice(-5).map(log => `Em ${log.date}, o humor era ${log.mood}.`).join(' ');

  const prompt = `
    Você é um coach de bem-estar e produtividade. Sua tarefa é criar um desafio semanal personalizado para um usuário com base em seus hábitos, metas e humor recente.
    O desafio deve ser encorajador, realista e focado em um dos hábitos existentes do usuário.

    **Contexto do Usuário:**
    1.  **Hábitos Existentes:**
        ${habitsContext}
    2.  **Metas Atuais:**
        ${goalsContext || "Nenhuma meta definida."}
    3.  **Humor Recente:**
        ${recentMoods || "Nenhum humor registrado recentemente."}

    **Sua Missão:**
    - Analise os hábitos, metas e humor do usuário.
    - Escolha UM dos hábitos existentes para focar no desafio desta semana. Selecione um hábito que possa ajudar o usuário a progressir em suas metas ou melhorar seu humor.
    - Crie uma descrição curta e motivadora para o desafio (ex: "Complete o hábito 'Ler 20 páginas' 5 vezes esta semana para expandir seus conhecimentos!").
    - Defina uma meta de conclusão realista para a semana (um 'target' numérico, geralmente entre 3 e 7).
    - Responda **APENAS** com um objeto JSON válido, seguindo o schema fornecido.

    **Exemplo de Resposta:**
    {
      "habitId": "id_do_habito_escolhido",
      "description": "Pratique meditação por 10 minutos em 4 dias desta semana para encontrar mais calma e foco.",
      "target": 4
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            habitId: { type: Type.STRING, description: "O ID de um dos hábitos existentes fornecidos." },
            description: { type: Type.STRING, description: "A descrição motivadora para o desafio semanal." },
            target: { type: Type.NUMBER, description: "A meta numérica de conclusão para a semana." },
          },
          required: ["habitId", "description", "target"],
        }
      }
    });

    const jsonString = response.text;
    const challengeData = JSON.parse(jsonString);

    if (habits.some(h => h.id === challengeData.habitId)) {
        return challengeData;
    }
    console.warn("Gemini returned a challenge for a non-existent habitId. Falling back.");
    return null;

  } catch (error) {
    console.error("Error calling Gemini API for weekly challenge generation:", error);
    return null;
  }
};

export const generateSmartRoutine = async (
  preferences: RoutinePreferences,
  appointments: Appointment[],
  tasks: Task[],
  habits: Habit[],
  goals: Goal[],
  latestMood: MoodLog | null,
): Promise<RoutineItem[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY not set. Returning mock data.");
    return [
      { time: '09:00', title: 'Tarefa: Preparar apresentação', duration: 60, type: 'task', icon: '✅' },
      { time: '10:00', title: 'Hábito: Ler 20 páginas', duration: 30, type: 'habit', icon: '🔄' },
      { time: '10:30', title: 'Pausa para café', duration: 15, type: 'break', icon: '☕' },
      { time: '11:00', title: 'Compromisso: Reunião de equipe', duration: 60, type: 'appointment', icon: '🗓️' },
    ];
  }

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  
  const moodContext = latestMood ? `O humor atual do usuário é '${latestMood.mood}'. Adapte a rotina a isso: se estiver 'cansado' ou 'estressado', inclua mais pausas e tarefas mais leves. Se estiver 'feliz', pode agendar tarefas mais desafiadoras.` : "Nenhum humor registrado para hoje.";

  const prompt = `
    Você é um assistente de produtividade especialista em criar rotinas diárias otimizadas.
    Sua tarefa é gerar um planejamento detalhado para o dia de hoje, ${today}, para um usuário.

    **Contexto do Usuário:**
    1.  **Preferências de Horário:** O dia produtivo do usuário começa às ${preferences.startTime} e termina às ${preferences.endTime}.
    2.  **Prioridades para Hoje:** As principais áreas de foco são: ${preferences.priorities.join(', ')}. Dê mais peso a atividades relacionadas a essas áreas.
    3.  **Estado Emocional:** ${moodContext}
    4.  **Compromissos Fixos (Não podem ser movidos):**
        ${appointments.length > 0 ? JSON.stringify(appointments.map(a => ({ titulo: a.title, horario: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), duracao: a.duration }))) : "Nenhum compromisso fixo hoje."}
    5.  **Tarefas Pendentes (Encaixe nos horários livres, priorize as de 'alta' prioridade):**
        ${tasks.length > 0 ? JSON.stringify(tasks.map(t => ({ titulo: t.title, prioridade: t.priority, prazo: t.dueDate }))) : "Nenhuma tarefa pendente."}
    6.  **Hábitos a serem incluídos:**
        ${habits.length > 0 ? JSON.stringify(habits.map(h => ({ nome: h.name, meta_diaria: h.dailyGoal, unidade: h.progressUnit }))) : "Nenhum hábito para incluir."}
    7.  **Metas de Longo Prazo (Aloque tempo para trabalhar nelas, se possível):**
        ${goals.length > 0 ? JSON.stringify(goals.map(g => ({ nome: g.name, categoria: g.category }))) : "Nenhuma meta de longo prazo."}

    **Sua Missão:**
    - Crie uma lista de itens de rotina para hoje, começando em ${preferences.startTime} e terminando até ${preferences.endTime}.
    - Respeite os horários dos compromissos fixos.
    - Distribua as tarefas e hábitos nos horários livres.
    - **IMPORTANTE:** Inclua pausas de 10-15 minutos a cada 60-90 minutos de trabalho focado. Inclua uma pausa para almoço de 45-60 minutos por volta do meio-dia.
    - Se houver tempo, adicione blocos de "Foco na Meta" para as metas de longo prazo.
    - O título de cada item deve ser claro e conciso.
    - Para cada item, selecione um emoji apropriado para o campo 'icon'.
    - O 'type' deve ser um dos seguintes: 'appointment', 'task', 'habit', 'break', 'goal', 'focus'.
    - A 'duration' é em minutos.
    - Não deixe grandes blocos de tempo vazios. Se houver tempo livre, adicione mais pausas ou blocos de foco flexíveis.
    
    Responda **APENAS** com um array JSON válido, seguindo o schema fornecido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Horário de início (HH:MM)" },
              title: { type: Type.STRING, description: "Título da atividade" },
              duration: { type: Type.NUMBER, description: "Duração em minutos" },
              type: { type: Type.STRING, description: "Tipo da atividade (appointment, task, habit, break, goal, focus)" },
              icon: { type: Type.STRING, description: "Um emoji para representar a atividade" },
            },
            required: ["time", "title", "duration", "type", "icon"],
          }
        }
      }
    });
    
    const jsonString = response.text;
    const routine = JSON.parse(jsonString);
    return routine as RoutineItem[];
  } catch (error) {
    console.error("Error calling Gemini API for routine generation:", error);
    throw new Error("Failed to generate smart routine from AI.");
  }
};