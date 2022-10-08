import { DbAuthentication } from './db-authentication';
import {
  AccountModel,
  AuthenticationModel,
  HashComparer,
  LoadAccountByEmailRepository,
  TokenGenerator
} from './db-authentication-protocols';

interface SutTypes {
  loadAccountByEmailRepoStub: LoadAccountByEmailRepository;
  hashComparerStub: HashComparer;
  tokenGeneratorStub: TokenGenerator;
  sut: DbAuthentication;
}

const makeFakeAccount = (): AccountModel => ({
  id: 'any_id',
  name: 'name',
  email: 'email@email.com',
  password: 'wTzVTHQ6'
});

const makeFakeAuthInput = (): AuthenticationModel => ({
  email: 'email@email.com',
  password: 'password'
});

const makeLoadAccountByEmailRepoStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepoStub implements LoadAccountByEmailRepository {
    async loadAccount(email: string): Promise<AccountModel> {
      return new Promise((resolve) => resolve(makeFakeAccount()));
    }
  }
  return new LoadAccountByEmailRepoStub();
};

const makeTokenGeneratorStub = (): TokenGenerator => {
  class TokenGeneratorStub implements TokenGenerator {
    async generate(id: string): Promise<string> {
      return new Promise((resolve) => resolve('any_token'));
    }
  }
  return new TokenGeneratorStub();
};

const makeHashComparerStub = () => {
  class HashComparerStub implements HashComparer {
    async compare(value: string, hash: string): Promise<boolean> {
      return new Promise((resolve) => resolve(true));
    }
  }
  return new HashComparerStub();
};

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepoStub = makeLoadAccountByEmailRepoStub();
  const hashComparerStub = makeHashComparerStub();
  const tokenGeneratorStub = makeTokenGeneratorStub();
  const sut = new DbAuthentication(
    loadAccountByEmailRepoStub,
    hashComparerStub,
    tokenGeneratorStub
  );
  return {
    sut,
    loadAccountByEmailRepoStub,
    hashComparerStub,
    tokenGeneratorStub
  };
};

describe('DbAuthentication', () => {
  describe('LoadAccountByEmailRepository', () => {
    test(' Should call LoadAccountByEmailRepository with correct email', async () => {
      const { sut, loadAccountByEmailRepoStub } = makeSut();
      const loadAccountSpy = jest.spyOn(
        loadAccountByEmailRepoStub,
        'loadAccount'
      );
      await sut.authenticate(makeFakeAuthInput());
      expect(loadAccountSpy).toHaveBeenCalledWith('email@email.com');
    });

    test('Should throw if LoadAccountByEmailRepository throws', async () => {
      const { sut, loadAccountByEmailRepoStub } = makeSut();
      jest
        .spyOn(loadAccountByEmailRepoStub, 'loadAccount')
        .mockRejectedValueOnce(() => {
          throw new Error();
        });
      const promise = sut.authenticate(makeFakeAuthInput());
      await expect(promise).rejects.toThrow();
    });

    test(' Should return null if LoadAccountByEmailRepository returns null', async () => {
      const { sut, loadAccountByEmailRepoStub } = makeSut();
      jest
        .spyOn(loadAccountByEmailRepoStub, 'loadAccount')
        .mockReturnValueOnce(null);
      const authToken = await sut.authenticate(makeFakeAuthInput());
      expect(authToken).toBeNull();
    });
  });

  describe('HashComparer', () => {
    test(' Should call HashComparer with correct password', async () => {
      const { sut, hashComparerStub } = makeSut();
      const compareSpy = jest.spyOn(hashComparerStub, 'compare');
      await sut.authenticate(makeFakeAuthInput());
      expect(compareSpy).toHaveBeenCalledWith('password', 'wTzVTHQ6');
    });

    test('Should throw if HashComparer throws', async () => {
      const { sut, hashComparerStub } = makeSut();
      jest.spyOn(hashComparerStub, 'compare').mockRejectedValueOnce(() => {
        throw new Error();
      });
      const promise = sut.authenticate(makeFakeAuthInput());
      await expect(promise).rejects.toThrow();
    });

    test(' Should return null if comparison fails', async () => {
      const { sut, hashComparerStub } = makeSut();
      jest.spyOn(hashComparerStub, 'compare').mockResolvedValueOnce(false);
      const authToken = await sut.authenticate(makeFakeAuthInput());
      expect(authToken).toBeNull();
    });
  });

  describe('TokenGenerator', () => {
    test(' Should call TokenGenerator with correct id', async () => {
      const { sut, tokenGeneratorStub } = makeSut();
      const generateSpy = jest.spyOn(tokenGeneratorStub, 'generate');
      await sut.authenticate(makeFakeAuthInput());
      expect(generateSpy).toHaveBeenCalledWith('any_id');
    });
  });
});
