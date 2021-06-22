import {getInput,setFailed} from '@actions/core';
import {exec} from '@actions/exec';
import zenodraft from 'zenodraft'


export const main = async (): Promise<void> => {

    try {
        const collection_id = getInput('collection');
        const filenames = getInput('filenames');
        const metadata = getInput('metadata');
        const publish = getInput('publish');
        const sandbox = getInput('sandbox') === 'false' ? false : true;
        const verbose = false;

        // create the deposition as a new version in a new collection or
        // as a new version in an existing collection:
        let latest_id;
        if (collection_id === '') {
            latest_id = await zenodraft.deposition_create_in_new_collection(sandbox, verbose)
        } else {
            latest_id = await zenodraft.deposition_create_in_existing_collection(sandbox, collection_id, verbose)
        }

        // upload only the files specified in the filenames argument, or
        // upload a snapshot of the complete repository
        if (filenames === '') {
            await exec('tar', ['--help']);
            await exec('zip', ['--help']);
        } else {
            for (const filename of filenames) {
                await zenodraft.file_add(sandbox, latest_id, filename, verbose);
            }
        }

        // update the metadata if the user has specified a filename that contains metadata
        if (metadata !== '') {
            await zenodraft.metadata_update(sandbox, latest_id, metadata, verbose);
        }

        if (publish === 'true') {
            await zenodraft.deposition_publish(sandbox, latest_id, verbose)
        }

    } catch (error) {
        setFailed(error.message);
    }
}

main()
