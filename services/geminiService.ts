
import { GoogleGenAI, Type } from "@google/genai";
import { Appointment } from "../types";

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
