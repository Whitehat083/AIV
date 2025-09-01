import { GoogleGenAI, Type } from "@google/genai";
import { Appointment, Goal, Habit, HabitLog, Mood, MoodLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const suggestTimeSlots = async (appointments: Appointment[], duration: number): Promise<string[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set. Returning mock data.");
    // Return mock data if API key is not available
    return ["09:00", "14:00", "16:30"];
  }

  const existingAppointments = appointments.map(a => ({
      title: a.title,
      start: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      duration: a.duration
  }));

  const prompt = `
    Considere um dia de trabalho padrão das 08:00 às 18:00. 
    A lista de compromissos já agendados para hoje é: ${JSON.stringify(existingAppointments)}.
    Por favor, sugira três horários disponíveis para um novo compromisso com duração de ${duration} minutos.
    Evite sugerir horários que se sobreponham aos compromissos existentes ou que não permitam a duração total do novo compromisso antes do próximo.
    Considere um intervalo de 15 minutos entre os compromissos.
    Apresente as sugestões em um formato de array JSON de strings, como ["HH:MM", "HH:MM", "HH:MM"].
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
            type: Type.STRING,
            description: "Um horário sugerido no formato HH:MM"
          }
        },
      },
    });
    
    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    return suggestions as string[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to mock data in case of an API error
    return ["09:30", "13:00", "17:00"];
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
    return response.text.trim();
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
    Não seja repetitivo. Evite frases como "Analisando seus dados". Vá direto ao ponto.

    Registros de Humor:
    ${JSON.stringify(moodLogs.slice(-30))} // Analyze last 30 logs

    Responda apenas com o insight, sem introduções ou despedidas.
  `;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating emotional insights:", error);
    return "Não foi possível gerar um insight no momento. Tente novamente mais tarde.";
  }
}