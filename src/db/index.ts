import "reflect-metadata";

import { DataSource } from "typeorm";
import { env } from "../env.mjs";
import { WeekendLeaveBooking, Outing, AuthEntities } from "./models";
import type { Adapter } from "next-auth/adapters";
import type { EntityManager } from "typeorm";

const ENTITIES = [WeekendLeaveBooking, Outing, ...Object.values(AuthEntities)];

type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
};

class MyDataSource extends DataSource {
  async updateEntities(entities: typeof ENTITIES) {
    const mutableThis = this as Mutable<MyDataSource>;
    mutableThis.options = { ...mutableThis.options, entities };
    await super.buildMetadatas();
  }
}

const datasource = new MyDataSource({
  type: "oracle",
  entities: ENTITIES,
  synchronize: env.NODE_ENV === "development",
  port: parseInt(env.ORACLE_PORT),
  host: env.ORACLE_HOST,
  username: env.ORACLE_USER,
  password: env.ORACLE_PASSWORD,
  serviceName: env.ORACLE_SERVICE || undefined,
  sid: env.ORACLE_SID || undefined,
});

const entitiesChanged = (prevEntities: unknown[], newEntities: unknown[]) => {
  if (prevEntities.length !== newEntities.length) return true;
  return !prevEntities.every((entity, index) => entity === newEntities[index]);
};

export const getDataSource = async () => {
  if (!datasource.isInitialized) {
    await datasource.initialize();
    console.log("Datasource initialized successfully");
  }

  if (env.NODE_ENV === "development") {
    if (
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      entitiesChanged(datasource.options.entities! as unknown[], ENTITIES)
    ) {
      await datasource.updateEntities(ENTITIES);
    }
  }
  return datasource;
};

export const getManager = async (): Promise<EntityManager> => {
  const datasource = await getDataSource();
  return datasource.manager;
};

export function TypeORMAdapter(): Adapter<true> {
  return {
    /**
     * Method used in testing. You won't need to call this in your app.
     * @internal
     */
    async __disconnect() {
      const datasource = await getDataSource();
      await datasource.destroy();
    },

    // @ts-expect-error UserEntity is not assignable to type 'AdapterUser'
    async createUser(user) {
      const manager = await getManager();
      const myUser = manager.create(AuthEntities.UserEntity, user);

      await manager.save(myUser);

      return myUser;
    },

    // @ts-expect-error UserEntity is not assignable to type 'AdapterUser'
    async getUser(id: string) {
      const manager = await getManager();
      const user = await manager.findOne(AuthEntities.UserEntity, {
        where: { id },
      });

      return user;
    },

    // @ts-expect-error UserEntity is not assignable to type 'AdapterUser'
    async getUserByEmail(email: string) {
      const manager = await getManager();
      const user = await manager.findOne(AuthEntities.UserEntity, {
        where: { email },
      });

      return user;
    },

    // @ts-expect-error UserEntity is not assignable to type 'AdapterUser'
    async getUserByAccount(providerAccountId) {
      const manager = await getManager();
      const account = await manager.findOne(AuthEntities.AccountEntity, {
        where: providerAccountId,
        relations: ["user"],
      });

      return account ? account.user : null;
    },

    // @ts-expect-error UserEntity is not assignable to type 'AdapterUser'
    async updateUser(user) {
      const manager = await getManager();
      const myUser = manager.create(AuthEntities.UserEntity, user);

      await manager.save(myUser);

      return myUser;
    },

    async deleteUser(userId) {
      const manager = await getManager();
      await manager.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(AuthEntities.AccountEntity, {
          userId,
        });
        await transactionalEntityManager.delete(AuthEntities.SessionEntity, {
          userId,
        });
        await transactionalEntityManager.delete(AuthEntities.UserEntity, {
          id: userId,
        });
      });
    },

    // @ts-expect-error AccountEntity is not assignable to type 'Adapter<Account>'
    async linkAccount(account) {
      const manager = await getManager();
      const myAccount = manager.create(AuthEntities.AccountEntity, account);

      await manager.save(myAccount);

      return myAccount;
    },

    async unlinkAccount(providerAccountId) {
      const manager = await getManager();
      await manager.delete(AuthEntities.AccountEntity, providerAccountId);
    },

    async createSession(session) {
      const manager = await getManager();
      const mySession = manager.create(AuthEntities.SessionEntity, session);

      await manager.save(mySession);

      return mySession;
    },

    // @ts-expect-error SessionEntity is not assignable to type 'AdapterSession'
    async getSessionAndUser(sessionToken) {
      const manager = await getManager();
      const session = await manager.findOne(AuthEntities.SessionEntity, {
        where: { sessionToken },
        relations: ["user"],
      });

      if (!session) {
        return null;
      }

      return {
        session: session,
        user: session.user,
      };
    },

    async updateSession(session) {
      const manager = await getManager();

      await manager.update(
        AuthEntities.SessionEntity,
        { sessionToken: session.sessionToken },
        session
      );

      return null;
    },

    async deleteSession(sessionToken) {
      const manager = await getManager();
      await manager.delete(AuthEntities.SessionEntity, { sessionToken });
    },

    async createVerificationToken(verificationToken) {
      const manager = await getManager();
      const myVerificationToken = manager.create(
        AuthEntities.VerificationTokenEntity,
        verificationToken
      );

      await manager.save(myVerificationToken);

      return myVerificationToken;
    },

    async useVerificationToken(params) {
      const manager = await getManager();
      const verificationToken = await manager.findOne(
        AuthEntities.VerificationTokenEntity,
        {
          where: params,
        }
      );

      if (!verificationToken) {
        return null;
      }

      await manager.remove(verificationToken);

      return verificationToken;
    },
  };
}
