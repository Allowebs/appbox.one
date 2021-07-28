import React from 'react';
import { Link } from 'gatsby';
import { useIntl } from 'gatsby-plugin-intl';
import { useRecoilValue } from 'recoil';

import { invoicesState } from '../atoms';
import { months } from '../utils';
import DocumentIcon from '../images/document.svg';

export default () => {
    const intl = useIntl();

    const invoices = useRecoilValue(invoicesState);

    if (invoices.length === 0) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <div className="flex flex-col justify-center">
                    <DocumentIcon className="w-20 m-auto text-gray-600" fill="none" />
                    <h4 className="text-center text-2xl">{intl.formatMessage({ id: 'You have no invoices' })}</h4>
                    <span className="rounded-md shadow-sm m-auto mt-3">
                        <Link
                            to="/"
                            className="inline-flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-gray active:bg-gray-700 transition duration-150 ease-in-out"
                        >
                            {intl.formatMessage({ id: 'Go to the store' })}
                        </Link>
                    </span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">{intl.formatMessage({ id: 'Invoices' })}</h1>
                <p className="mt-1 text-sm text-gray-500">{intl.formatMessage({ id: 'Below is the list of all your invoices' })}.</p>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-10">
                <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                {intl.formatMessage({ id: 'Month' })}
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                {intl.formatMessage({ id: 'Year' })}
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                {intl.formatMessage({ id: 'Status' })}
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                                {intl.formatMessage({ id: 'Total' })}
                                            </th>
                                            <th className="px-6 py-3 bg-gray-50">&nbsp;</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { invoices.map((invoice) => {
                                            return (
                                                <tr className="bg-white" key={invoice.date}>
                                                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                                                        {months[new Date(invoice.date).getMonth()]}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                                        {new Date(invoice.date).getFullYear()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                                        {invoice.status}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                                                        {invoice.total / 100}€
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
                                                        <a href={invoice.url} target="_blank" className="text-indigo-600 hover:text-indigo-900">{intl.formatMessage({ id: 'View invoice' })}</a>
                                                    </td>
                                                </tr>
                                            );
                                        }) }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
