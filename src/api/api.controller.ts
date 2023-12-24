import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiService } from './api.service';
import { UserInput } from './payloads/user-input.model';
import { FilterDataRequest } from './payloads/filter-data.model';
import { AggregateDataRequest } from './payloads/aggregate-data.model';

@Controller('api')
export class ApiController {
  constructor(private apiService: ApiService) {}
  @Get()
  getApiEndpoint(): string {
    return 'This is the /api endpoint!';
  }
  // Endpoint for logging model response to OpenAI and storing in Clickhouse
  @Post('/logData')
  logModelResponse(@Body() data: UserInput) {
    return this.apiService.logModelResponse(data.user_prompt, data.model);
  }

  // Endpoint for displaying filtered data from Clickhouse
  @Post('/DisplayFilterData')
  displayFilterData(@Body() data: FilterDataRequest) {
    return this.apiService.displayFilterData(
      data.filter_model,
      data.filter_operator_total_token,
      data.filter_total_tokens,
      data.filter_operator_prompt_token,
      data.filter_prompt_tokens,
    );
  }

  // Endpoint for fetching and displaying aggregated data from Clickhouse
  @Post('/AggregateValues')
  displayAggregateValue(@Body() data: AggregateDataRequest) {
    return this.apiService.displayAggregateValue(
      data.aggregate_metric,
      data.start_datetime,
      data.end_datetime,
      data.aggregate_method,
    );
  }
}
