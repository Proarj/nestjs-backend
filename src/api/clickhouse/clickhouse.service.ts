import { Injectable } from '@nestjs/common';
import { ClickHouse } from 'clickhouse';

@Injectable()
export class ClickhouseService {
  private clickhouse: ClickHouse;

  constructor() {
    // Initialize ClickHouse connection with credentials and URL
    this.clickhouse = new ClickHouse({
      url: 'https://jzfvreutov.asia-southeast1.gcp.clickhouse.cloud:8443',
      port: 8443,
      basicAuth: {
        username: 'default',
        password: '4~2KVquUn_TJZ',
      },
    });
  }

  //Function to log responses in clickhouse
  async logResponse(
    prompt: string,
    response: string,
    model: string,
    total_tokens: number,
    prompt_tokens: number,
    completion_tokens: number,
    generated_at: Date,
    latency: number,
    status: string,
  ): Promise<void> {
    // Construct INSERT query to log response data into ClickHouse table
    const query =
      'INSERT INTO openAiResponse ' +
      '(prompt, ' +
      'response, ' +
      'model, ' +
      'total_tokens, ' +
      'prompt_tokens, ' +
      'completion_tokens, ' +
      'generated_at, ' +
      'latency, ' + // Add 'latency' column to the INSERT query
      'status) ' +
      'VALUES (' +
      "'" +
      prompt.replace(/'/g, "''") +
      "', " +
      "'" +
      response.replace(/'/g, "''") +
      "', " +
      "'" +
      model +
      "', " +
      total_tokens +
      ', ' +
      prompt_tokens +
      ', ' +
      completion_tokens +
      ', ' +
      "'" +
      generated_at.toISOString().slice(0, 19).replace('T', ' ') +
      "'," +
      latency +
      ',' +
      "'" +
      status +
      "'" +
      ')';
    try {
      // Execute the query to log data into ClickHouse
      await this.clickhouse.query(query).toPromise();
    } catch (error) {
      console.error('Clickhouse Error:', error.message);
    }
  }

  //function to fetch data from clickhouse based on filters
  async getDbData(
    filter_model?: string,
    filter_operator_total_token?: string,
    filter_total_tokens?: number,
    filter_operator_prompt_token?: string,
    filter_prompt_tokens?: number,
  ) {
    // Construct SELECT query for fetching filtered data from ClickHouse
    let query = 'SELECT * FROM openAiResponse WHERE 1 = 1';
    if (filter_model) {
      query += ` AND model = '${filter_model}'`;
    }
    if (filter_operator_total_token && filter_total_tokens) {
      query += ` AND total_tokens ${filter_operator_total_token} ${filter_total_tokens}`;
    }
    if (filter_operator_prompt_token && filter_prompt_tokens) {
      query += ` AND prompt_tokens ${filter_operator_prompt_token} ${filter_prompt_tokens}`;
    }
    try {
      // Execute the query to fetch filtered data from ClickHouse
      return await this.clickhouse.query(query).toPromise();
    } catch (error) {
      console.error('Clickhouse Error:', error.message);
    }
  }

  //function to calculate aggregated values
  async aggregateInputValue(
    aggregate_metric: string,
    start_datetime: string,
    end_datetime: string,
    aggregate_method?: string,
  ) {
    let query = '';
    if (aggregate_metric === 'Number Of Requests') {
      // Construct query to count the number of requests within the specified time range
      query = `SELECT COUNT(*) AS num_request 
                FROM openAiResponse 
                WHERE generated_at >= '${start_datetime}' 
                AND generated_at <= '${end_datetime}'`;
    } else {
      // Construct query to aggregate the specified metric within the time range
      query = `SELECT ${aggregate_method}(${aggregate_metric}) AS aggregated_value
                 FROM openAiResponse 
                 WHERE generated_at >= '${start_datetime}' 
                 AND generated_at <= '${end_datetime}'`;
    }
    try {
      return await this.clickhouse.query(query).toPromise();
    } catch (error) {
      console.error('Clickhouse Error:', error.message);
    }
  }
}
