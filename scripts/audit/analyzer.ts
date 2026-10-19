import { Project, SyntaxKind, Node, JsxElement, JsxSelfClosingElement } from "ts-morph";
import * as fs from "fs";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const components: any[] = [];
const uiElements: any[] = [];
const functions: any[] = [];
const eventHandlers: any[] = [];

let cmpIdCounter = 1;
let uiIdCounter = 1;
let funcIdCounter = 1;

function getLine(node: Node) {
    return node.getStartLineNumber();
}

function processFile(file: any) {
    const filePath = file.getFilePath();
    if (!filePath.includes("/src/")) return;
    
    // Find functions
    const allFunctions = [
        ...file.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
        ...file.getDescendantsOfKind(SyntaxKind.ArrowFunction),
        ...file.getDescendantsOfKind(SyntaxKind.FunctionExpression),
        ...file.getDescendantsOfKind(SyntaxKind.MethodDeclaration)
    ];

    allFunctions.forEach((func: any) => {
        let name = "anonymous";
        if (Node.isFunctionDeclaration(func) || Node.isMethodDeclaration(func)) {
            name = func.getName() || "anonymous";
        } else if (Node.isVariableDeclaration(func.getParent())) {
            name = (func.getParent() as any).getName();
        }
        
        let returnsJsx = false;
        const returnStatements = func.getDescendantsOfKind(SyntaxKind.ReturnStatement);
        for (const ret of returnStatements) {
            if (ret.getExpression() && (
                Node.isJsxElement(ret.getExpression()!) || 
                Node.isJsxFragment(ret.getExpression()!) ||
                Node.isParenthesizedExpression(ret.getExpression()!)
            )) {
                returnsJsx = true;
                break;
            }
        }
        
        if (Node.isArrowFunction(func)) {
            const body = func.getBody();
            if (Node.isJsxElement(body) || Node.isJsxFragment(body) || Node.isParenthesizedExpression(body)) {
                returnsJsx = true;
            }
        }

        const isComponent = returnsJsx && name !== "anonymous" && /^[A-Z]/.test(name);
        
        if (isComponent) {
            components.push({
                id: `CMP-${String(cmpIdCounter++).padStart(3, '0')}`,
                name,
                file: filePath.split('/src/')[1],
                line: getLine(func)
            });
        } else {
            functions.push({
                id: `FUNC-${String(funcIdCounter++).padStart(3, '0')}`,
                name,
                file: filePath.split('/src/')[1],
                line: getLine(func)
            });
        }
    });

    // Find UI elements
    const jsxElements = [
        ...file.getDescendantsOfKind(SyntaxKind.JsxElement),
        ...file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    ];

    jsxElements.forEach((jsx: any) => {
        const tagName = Node.isJsxElement(jsx) ? 
            jsx.getOpeningElement().getTagNameNode().getText() : 
            jsx.getTagNameNode().getText();
        
        const attributes = Node.isJsxElement(jsx) ? 
            jsx.getOpeningElement().getAttributes() : 
            jsx.getAttributes();
            
        let hasHandler = false;
        
        attributes.forEach((attr: any) => {
            if (Node.isJsxAttribute(attr)) {
                const attrName = attr.getNameNode().getText();
                if (attrName.startsWith("on")) {
                    hasHandler = true;
                    eventHandlers.push({
                        element: tagName,
                        event: attrName,
                        file: filePath.split('/src/')[1],
                        line: getLine(attr)
                    });
                }
            }
        });

        if (/^[a-z]/.test(tagName) || hasHandler || ["Button", "IconButton"].includes(tagName)) {
            uiElements.push({
                id: `UI-${String(uiIdCounter++).padStart(3, '0')}`,
                type: tagName,
                file: filePath.split('/src/')[1],
                line: getLine(jsx),
                hasHandler
            });
        }
    });
}

project.getSourceFiles().forEach(processFile);

fs.writeFileSync("output.json", JSON.stringify({ components, uiElements, functions, eventHandlers }, null, 2));
console.log("Done");
