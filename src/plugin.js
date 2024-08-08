// noinspection JSUnusedGlobalSymbols
/*--------------------------------------------------------------------------------------------------------------------*/

import * as fs from 'fs';

import * as path from 'path';

/*--------------------------------------------------------------------------------------------------------------------*/

export default class IndiWebpackPlugin
{
    /*----------------------------------------------------------------------------------------------------------------*/

    constructor(addonName, addonPath)
    {
        this.addonName = addonName;

        this.addonRootPath = addonPath;
        const addonDist = path.join(addonPath, 'dist');
        this.addonDistPath = addonDist;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    apply(compiler)
    {
        const ROOT = this.addonRootPath;
        const DIST = this.addonDistPath;

        /*------------------------------------------------------------------------------------------------------------*/
        /* EXTERNALS                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        if(typeof compiler.options.output === 'undefined') {
            compiler.options.output = {};
        }

        /*------------------------------------------------------------------------------------------------------------*/

        compiler.options.output['path'] = DIST;

        compiler.options.output['filename'] = 'index.js';

        compiler.options.output['libraryTarget'] = 'window';

        /*------------------------------------------------------------------------------------------------------------*/
        /* EXTERNALS                                                                                                  */
        /*------------------------------------------------------------------------------------------------------------*/

        if(typeof compiler.options.externals === 'undefined') {
            compiler.options.externals = {};
        }

        compiler.options.externals['vue'] = 'Vue';
        compiler.options.externals['vue-router'] = 'VueRouter';
        compiler.options.externals['bootstrap'] = 'Bootstrap';
        compiler.options.externals['chart.js/auto'] = 'Chart';

        /*------------------------------------------------------------------------------------------------------------*/

        compiler.hooks.done.tap('CreatePackagePlugin', () => {

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
