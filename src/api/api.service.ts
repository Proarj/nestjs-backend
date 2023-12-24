import { Injectable } from '@nestjs/common';
import OpenAi from 'openai';
import { ClickhouseService } from './clickhouse/clickhouse.service';

@Injectable()
export class ApiService {
  private openApi: OpenAi;

  constructor(private clickhouseService: ClickhouseService) {
    // Initialize OpenAI API with environment variables
    this.openApi = new OpenAi({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.ORAGANIZATION_ID,
    });
  }

  /*
  Table schema for the 'openAiResponse' table in ClickHouse
  Columns:
  - prompt: String (User prompt)
  - response: String (Generated response)
  - model: String (Model used)
  - total_tokens: UInt32 (Total tokens used)
  - prompt_tokens: UInt32 (Tokens from prompt)
  - completion_tokens: UInt32 (Tokens from completion)
  - generated_at: DateTime (Timestamp of response generation)
  - latency: UInt64 (Latency in milliseconds)
  - status: String (Status of the response, e.g., success or failure)
  */

  //Log AI model response to Clickhouse service
  async logModelResponse(user_prompt: string, model: string) {
    try {
      // Prepare parameters for AI model completion
      const params: OpenAi.CompletionCreateParamsNonStreaming = {
        model: model,
        prompt: user_prompt,
        temperature: 0.3,
        max_tokens: 100,
      };

      // Generate response from OpenAI API
      const startTime = new Date();
      startTime.setTime(startTime.getTime() + 5.5 * 60 * 60 * 1000);
      const response = await this.openApi.completions.create(params);
      //calculate latency
      const generated_at = new Date();
      generated_at.setTime(generated_at.getTime() + 5.5 * 60 * 60 * 1000);
      const latency = generated_at.getTime() - startTime.getTime();
      //Extract relevant data from the response
      const response_text = response.choices[0].text
        .replace(/^(\?)+/, '')
        .trim();
      const { total_tokens, completion_tokens, prompt_tokens } = response.usage;
      // Log response data to Clickhouse
      await this.clickhouseService.logResponse(
        user_prompt,
        response_text,
        response.model,
        total_tokens,
        completion_tokens,
        prompt_tokens,
        generated_at,
        latency,
        'success',
      );
      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Log failure details to Clickhouse for error tracking using logResponse method
      const errorDetails = {
        user_prompt,
        error_message: error.message,
        generated_at: new Date(),
        status: 'failure',
      };

      await this.clickhouseService.logResponse(
        errorDetails.user_prompt,
        'Failed to generate completion: ' + errorDetails.error_message,
        null,
        null,
        null,
        null,
        errorDetails.generated_at,
        null,
        errorDetails.status,
      );
      throw new Error('Failed to generate completion');
    }
  }

  // Fetch filtered data from Clickhouse
  async displayFilterData(
    filter_model?: string,
    filter_operator_total_token?: string,
    filter_total_tokens?: number,
    filter_operator_prompt_token?: string,
    filter_prompt_tokens?: number,
  ) {
    try {
      return await this.clickhouseService.getDbData(
        filter_model,
        filter_operator_total_token,
        filter_total_tokens,
        filter_operator_prompt_token,
        filter_prompt_tokens,
      );
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      throw new Error('Failed to fetch filtered data');
    }
  }

  async displayAggregateValue(
    aggregate_metric: string,
    start_datetime: string,
    end_datetime: string,
    aggregate_method?: string,
  ) {
    try {
      return await this.clickhouseService.aggregateInputValue(
        aggregate_metric,
        start_datetime,
        end_datetime,
        aggregate_method,
      );
    } catch (error) {
      console.error('Error fetching aggregated data:', error);
      throw new Error('Failed to fetch aggregated data');
    }
  }
}
