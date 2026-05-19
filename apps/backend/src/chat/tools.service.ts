import { Injectable } from '@nestjs/common';
import { Tool, tool } from 'ai';
import z from 'zod';

@Injectable()
export class ToolsService {
  getWeatherTool(): Tool<{ location: string }> {
    return tool({
      description: 'Get the current weather for the location',
      inputSchema: z.object({
        location: z.string().describe('the city name'),
      }),
      execute: ({ location }) => {
        const temps = [68, 72, 75, 80, 85];
        const conditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy'];

        return {
          location,
          temperature: temps[Math.floor(Math.random() * temps.length)],
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          humidity: Math.floor(Math.random() * 40) * 40,
        };
      },
    });
  }

  getAllTools() {
    return {
      weather: this.getWeatherTool(),
    };
  }
}
