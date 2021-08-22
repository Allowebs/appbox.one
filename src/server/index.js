import 'babel-polyfill';
import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import path from 'path';
import compression from 'compression';
import bodyParser from 'body-parser';
import { ApolloServer } from 'apollo-server-express';
import { PrismaClient } from '@prisma/client';
import typeDefs from './schema.graphql';
import { init, isValidToken, decodeToken } from './utils';
import metrics from './metrics';
import './cron';
import {
    userQuery,
    stripeQuery,
    settingsQuery,
    webhooksQuery,
    applicationEnvsQuery,
    applicationQuery,
    applicationsQuery,
    templatesQuery,
    invoicesQuery,
    registerMutation,
    loginMutation,
    resetMutation,
    deleteAccountMutation,
    resetPasswordMutation,
    removePaymentMethodMutation,
    uninstallApplicationMutation,
    createSessionCheckoutMutation,
    updateDefaultPaymentMethodMutation,
    installApplicationMutation,
    updateApplicationMutation,
    updateUserMutation,
    updateSettingsMutation,
    updateWebhooksMutation,
    updateTemplatesMutation,
    globalEnvsQuery,
} from './resolvers';

const prisma = new PrismaClient();
const prefixPath = process.env.PREFIX_PATH || '';

init(prisma);

const app = express();

const publicPath = (process.env.NODE_ENV === 'production') ? './' : '../../public/';
app.use(`${prefixPath}/`, express.static(path.join(__dirname, publicPath)));

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(`${prefixPath}/metrics`, metrics);

if (process.env.NODE_ENV !== 'production' || process.env.CI) {
    import('./test/test').then((test) => {
        app.use((req, res, next) => {
            req.prisma = prisma;
            next();
        });
        app.use(`${prefixPath}/test`, test.default);
    });
}

const resolvers = {
    Query: {
        user: userQuery,
        stripe: stripeQuery,
        applicationEnvs: applicationEnvsQuery,
        applications: applicationsQuery,
        application: applicationQuery,
        templates: templatesQuery,
        invoices: invoicesQuery,
        settings: settingsQuery,
        webhooks: webhooksQuery,
        globalEnvs: globalEnvsQuery,
    },
    Mutation: {
        register: registerMutation,
        login: loginMutation,
        reset: resetMutation,
        deleteAccount: deleteAccountMutation,
        resetpassword: resetPasswordMutation,
        installApplication: installApplicationMutation,
        removePaymentMethod: removePaymentMethodMutation,
        createSessionCheckout: createSessionCheckoutMutation,
        updateDefaultPaymentMethod: updateDefaultPaymentMethodMutation,
        uninstallApplication: uninstallApplicationMutation,
        updateApplication: updateApplicationMutation,
        updateUser: updateUserMutation,
        updateSettings: updateSettingsMutation,
        updateWebhooks: updateWebhooksMutation,
        updateTemplates: updateTemplatesMutation,
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: process.env.NODE_ENV !== 'production',
    context: async ({ req }) => {
        const token = req.headers['x-access-token'] || '';

        if (isValidToken(token)) {
            const data = decodeToken(token);

            const user = await prisma.user.findUnique({ where: { email: data.email } });

            return { prisma, user };
        }

        return { prisma };
    },
});

app.get(`${prefixPath}/ethibox.js`, async (_, res) => {
    const scriptPath = process.env.NODE_ENV === 'production' ? './prisma/ethibox.js' : path.join(__dirname, '../../prisma/ethibox.js');
    const script = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : '';
    res.send(script);
});

server.applyMiddleware({ app, path: `${prefixPath}/graphql` });

app.listen(process.env.PORT || 3000);
