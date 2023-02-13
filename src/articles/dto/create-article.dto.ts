/* 
required: title, description, body
optional: tagList
*/

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly body: string;

  @IsOptional()
  readonly tagList?: string[];
}
