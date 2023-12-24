import { ApiService } from '../api.service';
import { ClickhouseService } from '../clickhouse/clickhouse.service';
import OpenAi from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

describe('ApiService', () => {
  let apiService: ApiService;
  let clickhouseService: ClickhouseService;
  let openApi: OpenAi;

  beforeEach(() => {
    // Mock ClickhouseService and OpenAi
    clickhouseService = {
      logResponse: jest.fn(),
      getDbData: jest.fn(),
      aggregateInputValue: jest.fn(),
    } as unknown as ClickhouseService;

    openApi = {
      completions: {
        create: jest.fn(),
      },
    } as unknown as OpenAi;

    apiService = new ApiService(clickhouseService);
    // Inject the mocked OpenAI instance
    (apiService as any).openApi = openApi;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log model response successfully', async () => {
    const mockResponse = {
      choices: [{ text: 'Generated response' }],
      model: 'Test model',
      usage: {
        total_tokens: 100,
        completion_tokens: 50,
        prompt_tokens: 50,
      },
    };

    // Mock parameters
    const userPrompt = 'Test user prompt';
    const model = 'Test model';

    // Mock OpenAI API response
    (openApi.completions.create as jest.Mock).mockResolvedValue(mockResponse);

    await apiService.logModelResponse(userPrompt, model);

    expect(openApi.completions.create).toHaveBeenCalledWith({
      model,
      prompt: userPrompt,
      temperature: 0.3,
      max_tokens: 100,
    });

    expect(clickhouseService.logResponse).toHaveBeenCalledWith(
      userPrompt,
      'Generated response',
      'Test model',
      100,
      50,
      50,
      expect.any(Date),
      expect.any(Number),
      'success',
    );
  });

  it('should fetch filtered data successfully', async () => {
    // Mock filter data
    const mockFilterData = {
      filter_model: 'Test model',
      filter_operator_total_token: '>',
      filter_total_tokens: 50,
      filter_operator_prompt_token: '<=',
      filter_prompt_tokens: 100,
    };

    // Mock ClickhouseService response
    (clickhouseService.getDbData as jest.Mock).mockResolvedValue(
      'Filtered data',
    );

    const result = await apiService.displayFilterData(
      mockFilterData.filter_model,
      mockFilterData.filter_operator_total_token,
      mockFilterData.filter_total_tokens,
      mockFilterData.filter_operator_prompt_token,
      mockFilterData.filter_prompt_tokens,
    );

    expect(clickhouseService.getDbData).toHaveBeenCalledWith(
      'Test model',
      '>',
      50,
      '<=',
      100,
    );
    expect(result).toBe('Filtered data');
  });

  it('should fetch and display aggregated data successfully', async () => {
    // Mock aggregate data
    const mockAggregateData = {
      aggregate_metric: 'Test metric',
      start_datetime: '2023-01-01',
      end_datetime: '2023-12-31',
      aggregate_method: 'SUM',
    };

    // Mock ClickhouseService response
    (clickhouseService.aggregateInputValue as jest.Mock).mockResolvedValue(
      'Aggregated data',
    );

    const result = await apiService.displayAggregateValue(
      mockAggregateData.aggregate_metric,
      mockAggregateData.start_datetime,
      mockAggregateData.end_datetime,
      mockAggregateData.aggregate_method,
    );

    expect(clickhouseService.aggregateInputValue).toHaveBeenCalledWith(
      'Test metric',
      '2023-01-01',
      '2023-12-31',
      'SUM',
    );
    expect(result).toBe('Aggregated data');
  });
});
