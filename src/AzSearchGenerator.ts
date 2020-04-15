export function GenerateSearchAppHTMLString(serviceName: string, queryKey: string, index: any): string {
    let automagicString = "";
    let facetHtml = "";
    let indexName = index.name;
    let azsearchjsVersion = "0.0.21";
    let suggesterName = index.suggesterName;
    if(!suggesterName) {
        suggesterName = index.suggesters && index.suggesters[0] ? index.suggesters[0].name: "";
    }
    let facetFields = (index.fields as any[]).filter((field) => {
        return field.facetable && field.filterable;
    });

    let generateNumberRangeFacetString = (fieldName: string, dataType: string) => {
        return (
            `   automagic.addRangeFacet("${fieldName + "Facet"}", "${fieldName}", "${dataType}", 0, 1000000);
`
        );
    };

    let generateDateRangeFacetString = (fieldName: string) => {
        return (
            `   var startDate = new Date();
    startDate.setFullYear(1975);
    var endDate = new Date();
    automagic.addRangeFacet("${fieldName + "Facet"}", "${fieldName}", "date", startDate, endDate);
`
        );
    };

    let generateCheckboxFacetString = (fieldName: string, dataType: string) => {
        return (
            `   automagic.addCheckboxFacet("${fieldName + "Facet"}", "${fieldName}", "${dataType}");
`
        );
    };

    let generateFacetHTML = (fieldName: string) => {
        return (
        `
                            <li>
                                <div id="${fieldName + "Facet"}">
                                </div>
                            </li>`);
    };

    // add searchBox
    if(suggesterName) {
        automagicString +=
        `
    automagic.addSearchBox("searchBox",
        {
            highlightPreTag: "<b>",
            highlightPostTag: "</b>",
            suggesterName: "${suggesterName}"
        });
`;
    }
    else {
        automagicString +=
        `
    automagic.addSearchBox("searchBox");
`;
    }
    // create facets
    facetFields.forEach((field) => {
        let facetString = "";
        switch (field.type) {
            case "Edm.String":
                facetString = generateCheckboxFacetString(field.name, "string");
                break;
            case "Collection(Edm.String)":
                facetString = generateCheckboxFacetString(field.name, "collection");
                break;
            case "Edm.DateTimeOffset":
                facetString = generateDateRangeFacetString(field.name);
                break;
            case "Edm.Int64":
            case "Edm.Int32":
            case "Edm.Double":
                facetString = generateNumberRangeFacetString(field.name, "number");
                break;
            default:
                break;
        }

        if(facetString) {
            automagicString += facetString;
            facetHtml += generateFacetHTML(field.name);
        }
    });




    let template = `<!DOCTYPE html>

<head>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
        crossorigin="anonymous">

    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
        crossorigin="anonymous">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/azsearch.js@${azsearchjsVersion}/dist/AzSearch.css">
    <title>AzSearch.js</title>
</head>

<body>
    <div id="app">
        <nav class="navbar navbar-inverse navbar-fixed-top">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#facetPanel" aria-expanded="false"
                        aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <div class="row">
                        <div class="col-md-2 pagelabel">
                            <a class="navbar-brand pagelabel" href="https://github.com/Azure-Samples/AzSearch.js">AzSearch.js</a>
                        </div>
                        <div id="searchBox" class="col-mid-8 col-sm-8 col-xs-6"></div>
                        <div id="navbar" class="navbar-collapse collapse">

                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container-fluid">
            <div class="row">
                <div id="facetPanel" class="col-sm-3 col-md-3 sidebar collapse">
                    <ul class="nav nav-sidebar">
                        <div className="panel panel-primary behclick-panel">
                            ${facetHtml}
                        </div>
                    </ul>
                </div>
                <div class="col-sm-9 col-sm-offset-3 col-md-9 col-md-offset-3 results_section">
                    <div id="results" class="row placeholders">
                    </div>
                    <div id="pager" class="row">
                    </div>
                </div>
            </div>
        </div>
        <!-- Bootstrap core JavaScript
            ================================================== -->
        <!-- Placed at the end of the document so the pages load faster -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
            crossorigin="anonymous"></script>
</body>
<!-- Dependencies -->
<script src="https://cdn.jsdelivr.net/react/15.5.0/react.min.js"></script>
<script src="https://cdn.jsdelivr.net/react/15.5.0/react-dom.min.js"></script>
<script type="text/javascript" src="https://cdn.jsdelivr.net/redux/3.6.0/redux.min.js"></script>
<!-- Main -->
<script src="https://cdn.jsdelivr.net/npm/azsearch.js@${azsearchjsVersion}/dist/AzSearch.bundle.js"></script>
<script>
    // Initialize and connect to your search service
    var automagic = new AzSearch.Automagic({ index: "${indexName}", queryKey: "${queryKey}", service: "${serviceName}" });
    // add a results view using the template defined above
    automagic.addResults("results", { count: true });
    // Adds a pager control << 1 2 3 ... >>
    automagic.addPager("pager");
    ${automagicString}
</script>
<style>

</style>

</html>`



    return template;
}