import { Expose } from 'class-transformer';

class UserDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  image: string;

  @Expose()
  token: string;
}

export class UserResponseDto {
  @Expose()
  user: UserDto;
}
