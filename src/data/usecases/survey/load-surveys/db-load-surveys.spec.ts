import { DbLoadSurveys } from './db-load-surveys';
import { LoadSurveysRepository } from '../../../protocols/db/survey/load-surveys-repository';
import { SurveyModel } from '../../../../domain/models/survey';

const makeFakeSurveys = (): SurveyModel[] => [
  {
    id: 'any_id',
    question: 'any_question',
    answers: [
      {
        image: 'any_image',
        answer: 'any_answer'
      }
    ],
    date: new Date()
  },
  {
    id: 'other_id',
    question: 'other_question',
    answers: [
      {
        image: 'other_image',
        answer: 'other_answer'
      }
    ],
    date: new Date()
  }
];

const makeLoadSurveyRepositoryStub = () => {
  class LoadSurveyRepositoryStub implements LoadSurveysRepository {
    async loadAll(): Promise<SurveyModel[]> {
      return new Promise((resolve) => resolve(makeFakeSurveys()));
    }
  }
  return new LoadSurveyRepositoryStub();
};

interface SutTypes {
  sut: DbLoadSurveys;
  loadSurveyRepositoryStub: LoadSurveysRepository;
}

const makeSut = (): SutTypes => {
  const loadSurveyRepositoryStub = makeLoadSurveyRepositoryStub();
  const sut = new DbLoadSurveys(loadSurveyRepositoryStub);
  return {
    sut,
    loadSurveyRepositoryStub
  };
};

describe('DbLoadSurveys', () => {
  test('Should call LoadSurveyRepository', async () => {
    const { sut, loadSurveyRepositoryStub } = makeSut();
    const loadAllSpy = jest.spyOn(loadSurveyRepositoryStub, 'loadAll');
    await sut.load();
    expect(loadAllSpy).toHaveBeenCalled();
  });

  test('Should return a list of surveys on success', async () => {
    const { sut } = makeSut();
    const surveys = await sut.load();
    expect(surveys).toEqual(makeFakeSurveys());
  });
});
