import { GenerateSearchAppHTMLString } from "./AzSearchGenerator";

import * as React from "react";
import { render } from "react-dom";

export type State = {
    queryKey: string,
    index: string,
    serviceName: string,
    error: string
};
export type Props = {};

function saveAs(uri: any, filename: any) {
  var link = document.createElement('a');
  if (typeof link.download === 'string') {
    document.body.appendChild(link); //Firefox requires the link to be in the body
    link.download = filename;
    link.href = uri;
    link.click();
    document.body.removeChild(link); //remove the link when done
  } else {
    location.replace(uri);
  }
}

class GeneratorForm extends React.Component<Props, State> {
    constructor() {
        super({})
        this.state = {
            queryKey: "",
            index: "",
            serviceName: "",
            error: ""
        };
    }
    onGenerateClick() {
        let htmlString;
        try {
            let indexJSON = JSON.parse(this.state.index)
            htmlString = GenerateSearchAppHTMLString(this.state.serviceName, this.state.queryKey, indexJSON);
            this.setState({error: ""});

            let fileData = {
                mime: "text/html",
                filename: "azsearchjsApp.html",
                contents: htmlString
            };

            let blob = new Blob([fileData.contents], {type: fileData.mime});
            let url = URL.createObjectURL(blob);
            saveAs(url, fileData.filename);
        } catch(e) {
            this.setState({ error: "FAILED to parse index and create file"});
        }
    }
    onIndexChange(event: any) {
        this.setState({ index: event.target.value });
    }
    onQueryKeyChange(event: any) {
        this.setState({ queryKey: event.target.value });
    }
    onServiceNameChange(event: any) {
        this.setState({ serviceName: event.target.value });
    }
    render() {
        const { queryKey, index, serviceName, error } = this.state;
        let errorElement = error ? <h1 className="warning"> {error} </h1> : "";
        return (
            <div>
                {errorElement}
                <form>
                    <div className="form-group ">
                        <label htmlFor="querykeyInput">Query Key</label>
                        <input value={queryKey} onChange={this.onQueryKeyChange.bind(this)} className="form-control" id="querykeyInput" placeholder="xxxxxx-query-key-here-xxxx" />
                        <p className="help-block">Your key will not leave the browser. Leave it blank if you prefer and copy it into the generated HTML file.</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Azure Search index JSON</label>
                        <textarea value={index} onChange={this.onIndexChange.bind(this)} className="form-control" id="exampleInputPassword1" placeholder="Copy JSON index definition here" rows={15}> </textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="serviceNameInput">Service Name</label>
                        <div className="input-group">
                            <div className="input-group-addon">http://</div>
                            <input value={serviceName} onChange={this.onServiceNameChange.bind(this)} type="text" className="form-control" id="serviceNameInput" placeholder="serviceName" />
                            <div className="input-group-addon">.search.windows.net</div>
                        </div>
                    </div>

                </form>
                <button className="btn btn-default" onClick={this.onGenerateClick.bind(this)}>Generate App</button>
            </div>
        );
    }

}



render(
    <GeneratorForm />,
    document.getElementById("app")
);

