// noinspection JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import * as fs from 'fs';

import * as path from 'path';

/*--------------------------------------------------------------------------------------------------------------------*/

export default class IndiWebpackPlugin
{
    /*----------------------------------------------------------------------------------------------------------------*/

    constructor(addonName)
    {
        addonName = addonName.trim();

        if(addonName.startsWith('addon'))
        {
            throw 'Addon name must not start with "addon"';
        }

        this.addonName = addonName;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    apply(compiler)
    {
        /*------------------------------------------------------------------------------------------------------------*/
        /* CONST                                                                                                      */
        /*------------------------------------------------------------------------------------------------------------*/

        const ROOT = compiler.context;

        const DIST = path.join(compiler.context, 'dist');

        const NAME = `addon_${this.addonName.toLowerCase().replace('-', '_')}`;

        /*------------------------------------------------------------------------------------------------------------*/
        /* OUTPUT                                                                                                     */
        /*------------------------------------------------------------------------------------------------------------*/

        if(typeof compiler.options.output.library === 'undefined') {
            compiler.options.output.library = {};
        }

        compiler.options.output.path = DIST;
        compiler.options.output.filename = 'index.js';
        compiler.options.output.library.type = 'window';
        compiler.options.output.library.name = NAME;

        /*------------------------------------------------------------------------------------------------------------*/
        /* EXTERNALS                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        if(typeof compiler.options.externals === 'undefined') {
            compiler.options.externals = {};
        }

        compiler.options.externals['vue'] = '__NYX_VUE__';
        compiler.options.externals['vue-router'] = '__NYX_VUE_ROUTER__';
        compiler.options.externals['bootstrap'] = '__NYX_BOOTSTRAP__';
        compiler.options.externals['chart.js/auto'] = '__NYX_CHART__';

        /*------------------------------------------------------------------------------------------------------------*/
        /* AFTER EMIT HOOK                                                                                            */
        /*------------------------------------------------------------------------------------------------------------*/

        compiler.hooks.afterEmit.tap('CreatePackage', () => {

            /*--------------------------------------------------------------------------------------------------------*/
            /* PACKAGE.JSON                                                                                           */
            /*--------------------------------------------------------------------------------------------------------*/

            try
            {
                /*----------------------------------------------------------------------------------------------------*/

                const SRC_PACKAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

                /*----------------------------------------------------------------------------------------------------*/

                const DST_PACKAGE = {
                    name: this.addonName,
                    main: "index.js",
                    entry: NAME,
                    description: SRC_PACKAGE.description || '',
                    version: SRC_PACKAGE.version || '',
                    author: SRC_PACKAGE.author || '',
                    license: SRC_PACKAGE.license || '',
                    repository: SRC_PACKAGE.repository || {},
                };

                /*----------------------------------------------------------------------------------------------------*/

                fs.writeFileSync(
                    path.join(DIST, 'package.json'),
                    JSON.stringify(DST_PACKAGE, null, 2),
                    'utf8'
                );

                /*----------------------------------------------------------------------------------------------------*/
            }
            catch(_)
            {
                console.warn('\x1b[31mError, "package.json" is corrupted!\x1b[0m\n');
            }

            /*--------------------------------------------------------------------------------------------------------*/
            /* README.MD                                                                                              */
            /*--------------------------------------------------------------------------------------------------------*/

            try
            {
                fs.copyFileSync(
                    path.join(ROOT, 'README.md'),
                    path.join(DIST, 'README.md')
                );
            }
            catch(_)
            {
                console.warn('\x1b[31mWarning, "README.md" is missing!\x1b[0m\n');
            }

            /*--------------------------------------------------------------------------------------------------------*/
        });
    }

    /*----------------------------------------------------------------------------------------------------------------*/
};
