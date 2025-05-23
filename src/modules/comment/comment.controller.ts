import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Controller } from '../../common/controller/controller.js';
import { HttpMethod } from '../../common/http-method.enum.js';
import { TYPES } from '../../types.js';
import { CommentServiceInterface } from './comment.service.interface.js';
import { CreateCommentDto } from './create-comment.dto.js';
import { HttpError } from '../../common/errors/http-error.js';
import { validateObjectId } from '../../app/middleware/validate-objectid.middleware.js';
import { checkExists } from '../../app/middleware/check-exists.middleware.js';
import { OfferServiceInterface } from '../offer/offer.service.interface.js';
import { UserServiceInterface } from '../user/user.service.interface.js';
import { validateDto } from '../../app/middleware/validate-dto.middleware.js';

@injectable()
export class CommentController extends Controller {
  constructor(
    @inject(TYPES.CommentService)
    private readonly commentService: CommentServiceInterface,
    @inject(TYPES.OfferService) private readonly offerService: OfferServiceInterface,
    @inject(TYPES.UserService) private readonly userService: UserServiceInterface,
  ) {
    super();

    this.addRoute({
      path: '/offers/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [validateObjectId('offerId'), checkExists('offerId', this.offerService, 'Offer')]
    });

    this.addRoute({
      path: '/offers/:offerId/comments/:userId',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [validateObjectId('offerId'),
        validateObjectId('userId'),
        validateDto(CreateCommentDto),
        checkExists('userId', this.userService, 'User'),
        checkExists('offerId', this.offerService, 'Offer')]
    });
  }

  private async index(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const comments = await this.commentService.findByOffer(offerId);

    if (!comments) {
      throw new HttpError(404, 'Offer not found', { offerId });
    }

    this.ok(res, comments);
  }

  private async create(req: Request, res: Response): Promise<void> {
    const { offerId, userId } = req.params;
    const dto = req.body as CreateCommentDto;
    const comment = await this.commentService.create(offerId, userId, dto);

    if (!comment) {
      throw new HttpError(404, 'Offer not found', { offerId });
    }

    this.created(res, comment);
  }
}

