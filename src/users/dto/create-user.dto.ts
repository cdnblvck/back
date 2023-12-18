export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  username: string;
  certified: boolean;
  salt: string;
  location: string;
}

export default CreateUserDto;
