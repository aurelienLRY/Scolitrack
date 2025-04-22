import { Commission, CommissionMember, User, Establishment } from "@prisma/client";




export type TCommissionWithMembers = Commission & {
  members?: CommissionMember[];
};

export type TCommissionMemberWithUser = CommissionMember & {
  user?: User;
};

export type TCommissionWithMembersAndUser = Commission & {
  members?: TCommissionMemberWithUser[];
};


export type TCommissionWithAllRelations = Commission & {
  members?: TCommissionMemberWithUser[];
  establishment?: Establishment;
};

