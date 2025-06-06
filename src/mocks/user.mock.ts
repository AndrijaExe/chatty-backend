import { IUserDocument } from 'src/features/user/interfaces/user.interface';

export const mockExistingUser = {
  notifications : {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social : {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '683d7efd7c3a8aadeccb0a44',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const existingUser = {
  notifications : {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social : {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '683d7efd7c3a8aadeccb0a44',
  uId: '308880849672',
  username: 'Danny',
  email: 'danny@test.com',
  avatarColor: 'red',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const existingUserTwo = {
  notifications : {
    messages: true,
    reactions: true,
    comments: true,
    follows: true
  },
  social : {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: ''
  },
  blocked: [],
  blockedBy: [],
  followersCount: 1,
  followingCount: 2,
  postsCount: 2,
  bgImageVersion: '',
  bgImageId: '',
  profilePicture: 'http://place-hold.it/500x500',
  _id: '683d7efd7c3a8aadeccb0a44',
  uId: '308880849672',
  username: 'Manny',
  email: 'manny@test.com',
  avatarColor: 'red',
  work: 'KickChat Inc.',
  school: 'University of Benin',
  location: 'Dusseldorf, Germany',
  quote: 'Sky is my limit',
  createdAt: new Date()
} as unknown as IUserDocument;

export const searchedUserMock = {
  profilePicture: 'http://place-hold.it/500x500',
  _id: '683d7efd7c3a8aadeccb0a44',
  uId: '308880849672',
  username: 'Kanny',
  email: 'kanny@test.com',
  avatarColor: 'red',
};

export const userJWT = 'dojnsojakndoklnsadjusbnaijbdIHBHSBAHUJBAsoihdnojsnaijdbihjsabdh';
