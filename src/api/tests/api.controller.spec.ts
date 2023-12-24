import { ApiController } from '../api.controller';
import { ApiService } from '../api.service';

describe('ApiController', () => {
  let apiController: ApiController;
  let apiService: ApiService;

  beforeEach(() => {
    apiService = {
      logModelResponse: jest.fn(),
      displayFilterData: jest.fn(),
      displayAggregateValue: jest.fn(),
    } as unknown as ApiService;

    apiController = new ApiController(apiService);
  });

  it('should log model response', () => {
    const mockUserInput = {
      user_prompt: 'Test user prompt',
      model: 'Test model',
    };

    apiController.logModelResponse(mockUserInput);

    expect(apiService.logModelResponse).toHaveBeenCalledWith(
      mockUserInput.user_prompt,
      mockUserInput.model,
    );
  });

  it('should display filtered data', () => {
    const mockFilterData = {
      filter_model: 'Test model',
      filter_operator_total_token: 'test_operator',
      filter_total_tokens: Math.max(
        1,
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      ),
      filter_operator_prompt_token: 'test_operator',
      filter_prompt_tokens: Math.max(
        1,
        Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      ),
    };

    apiController.displayFilterData(mockFilterData);

    expect(apiService.displayFilterData).toHaveBeenCalledWith(
      mockFilterData.filter_model,
      mockFilterData.filter_operator_total_token,
      mockFilterData.filter_total_tokens,
      mockFilterData.filter_operator_prompt_token,
      mockFilterData.filter_prompt_tokens,
    );
  });

  it('should display aggregated data', () => {
    const mockAggregateData = {
      aggregate_metric: 'Test metric',
      start_datetime: 'test_start_date',
      end_datetime: 'test_end_date',
      aggregate_method: 'mock method',
    };

    apiController.displayAggregateValue(mockAggregateData);

    expect(apiService.displayAggregateValue).toHaveBeenCalledWith(
      mockAggregateData.aggregate_metric,
      mockAggregateData.start_datetime,
      mockAggregateData.end_datetime,
      mockAggregateData.aggregate_method,
    );
  });
});
