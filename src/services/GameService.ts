import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import ShipRecord from '../entities/ShipRecord';

@injectable()
export default class GameService {
  private shipRepository: Repository<ShipRecord>;

  constructor(@inject('ShipRepository') shipRepository: Repository<ShipRecord>) {
    this.shipRepository = shipRepository;
  }

  // placeShip(req: Request): Ship{
  //   this;
  //   return new BattleShip();
  // }
}
