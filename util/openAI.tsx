import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { DarkTheme } from "../themes/Dark";
import Feather from "react-native-vector-icons/Feather";
import { useState } from "react";
import * as Clipboard from 'expo-clipboard';

// @ts-ignore
import SyntaxHighlighter from 'react-native-syntax-highlighter';
// @ts-ignore
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';
// @ts-ignore
import { tomorrow } from 'react-syntax-highlighter/styles/prism';

import CodeHighlighter from "react-native-code-highlighter";
import { atomOneDarkReasonable } from "react-syntax-highlighter/dist/esm/styles/hljs";

export type Message = {
    role: "system" | "user" | "assistant" | "function";
    content: string;
    name?: string | undefined;
    function_call?: string | undefined;
}

type Function = {
    name: string; // /^[\w_-]{1,64}$/gm;
    description?: string | undefined;
    parameters: {
        type: string;
        properties: any; // TODO
    };
}

type RequestBody = {
    model: string;
    messages: Message[];
    functions?: Function[];
    function_call?: string | { name: string } | undefined; // /^[\w_-]{1,64}$/gm;
    temperature?: number | undefined;
    top_p?: number | undefined;
    n?: number | undefined;
    stream?: boolean | undefined;
    stop?: string | string[] | undefined;
    max_tokens?: number | undefined;
    presence_penalty?: number | undefined;
    frequency_penalty?: number | undefined;
    logit_bias?: any; // TODO
    user?: string | undefined;
}

type ErrorResponse = {
    error: {
        message: string;
        type: string;
        param: string | null;
        code: string | null;
    }
};

type Choice = {
    index: number;
    message: Message;
    finish_reason: string;
};

type SuccessChatResponse = {
    error: undefined;
    id: string;
    object: string;
    created: number;
    choices: Choice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }
};

type Engine = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: {
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indicies: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    grop?: string | undefined;
    is_blocking: boolean;
  }[];
  root: string;
  parent?: string | undefined;
};

type SuccessListModelsResponse = {
  error: undefined;
  object: string;
  data: Engine[];
};

type ChatResponse = ErrorResponse | SuccessChatResponse;
type ListModelsResponse = ErrorResponse | SuccessListModelsResponse;

const openAIKeyReg = /^sk-\w{48}$/gm;
const COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export async function checkOpenAIToken(token: string): Promise<boolean> {
    if(!token) return false;

    openAIKeyReg.lastIndex = 0;
    if(!openAIKeyReg.test(token)) return false;

    const resp = await chatCompletion({
        model: "gpt-4",
        messages: [
            {
                role: "user",
                content: "Test"
            }
        ],
        max_tokens: 5
    }, token);

    return resp.error == undefined;
}

export async function listEngines(token: string): Promise<ListModelsResponse> {
  const resp = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  const json = await resp.json();
  return json as ListModelsResponse;
}

export async function chatCompletion(body: RequestBody, token: string): Promise<ChatResponse> {
    const resp = await fetch(COMPLETIONS_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body)
    });

    return (await resp.json()) as ChatResponse;
}

export function Code({
  language,
  code
}: {
  language: string | undefined;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <View
    style={{
      width: "100%",
      minWidth: '100%',
      marginRight: 10,
      marginVertical: 10
    }}
    >
        {language && (
        <View
        style={{
          backgroundColor: DarkTheme.background2,
          width: '100%',
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}
        >
          <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: DarkTheme.color,
          }}>
            {language}
          </Text>
          {copied ? (
            <View
            style={{
              flexDirection: 'row',
              gap: 5,
              alignItems: 'center'
            }}
            >
              <Feather
              name="check"
              size={16}
              color={DarkTheme.special}
              />

              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: DarkTheme.special,
                }}>
                Copied!
              </Text>
            </View>
          ) : (
            <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Clipboard.setStringAsync(code).catch((e) => {
                console.error(e);
              });

              setCopied(true);

              setTimeout(() => {
                setCopied(false);
              }, 3000);
            }}
            style={{
              flexDirection: 'row',
              gap: 5,
              alignItems: 'center'
            }}
            >
              <Feather
              name="copy"
              size={16}
              color={DarkTheme.color}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: DarkTheme.color,
                }}>
                Copy code
              </Text>
            </TouchableOpacity>
          )}
        </View>
        )}

        {language ? (
          <CodeHighlighter
            hljsStyle={atomOneDarkReasonable}
            containerStyle={{
              padding: 10,
              minWidth: '100%',
              backgroundColor: DarkTheme.primary
            }}
            textStyle={{
              fontSize: 18
            }}
            customStyle={{
              backgroundColor: DarkTheme.primary,
            }}
            language={language}
          >
            {code}
          </CodeHighlighter>  
        ) : (
          <Text  
          selectable 
          style={{
            fontFamily: 'monospace',
            backgroundColor: 'black',
            color: DarkTheme.color,
            padding: 10,
            fontSize: 16
          }}>
          {code}
          </Text>
        )}
      </View>
  )
}

const SINGLE_QUOTE = /(^|[^`])`[^`]*`($|[^`])/gms;
const TRIPPLE_QUOTE = /```[^`]*```/gms;

type Part = {
  type: 'single' | 'tripple' | 'normal';
  start: number;
  end: number;
};

export function formatText(text: string, style: any = {}) {
    let elements;

    if(text.includes('`')) {
      SINGLE_QUOTE.lastIndex = 0;
      TRIPPLE_QUOTE.lastIndex = 0;
  
      const parts: Part[] = [];
  
      let m;
      while((m = SINGLE_QUOTE.exec(text)) !== null) {
        if(m.index === SINGLE_QUOTE.lastIndex) {
          SINGLE_QUOTE.lastIndex++;
        }
  
        let result = m[0];
        let index = m.index;
        let length = result.length;
  
        if(result[0] !== '`') {
            index++;
            length--;
        }
        if(result[result.length - 1] !== '`') length--;
  
        parts.push({
          type: 'single',
          start: index,
          end: index + length
        });
      }
  
      if(text.includes('```')) {
        while((m = TRIPPLE_QUOTE.exec(text)) !== null) {
          if(m.index === TRIPPLE_QUOTE.lastIndex) {
            TRIPPLE_QUOTE.lastIndex++;
          }
    
          let result = m[0];
          let index = m.index;
          let length = result.length;
    
          if(result[0] !== '`') {
              index++;
              length--;
          }
          if(result[result.length - 1] !== '`') length--;
    
          parts.push({
            type: 'tripple',
            start: index,
            end: index + length
          });
        }
      }
      
      parts.sort((a, b) => a.start - b.start);
      const allParts: (Part[] | Part)[] = [];
      let currentPart: Part[] = [];
  
      let lastIndex = 0;
      parts.forEach(part => {
        if(part.start > lastIndex) {
          currentPart.push({
            type: 'normal',
            start: lastIndex,
            end: part.start
          });
        }
        
        if(part.type === 'tripple') {
          allParts.push(currentPart);
          allParts.push(part);
          currentPart = [];
        }
        else {
          currentPart.push(part);
        }

        lastIndex = part.end;
      });

      if(lastIndex < text.length) {
        currentPart.push({
          type: 'normal',
          start: lastIndex,
          end: text.length
        });
      }

      if(currentPart.length > 0) {
        allParts.push(currentPart);
      }

      elements = allParts.map((part, index) => {
        // We need to treet code as non text
        // Type == tripple
        if(!Array.isArray(part)) {
            const textPart = text.substring(part.start, part.end);

            const parts = textPart
              // Remove ``` from start and end
              .substring(3, textPart.length - 3)
              .split('\n');

            const language = parts.shift();
            
            return <Code
            key={index}
            language={language}
            code={parts.join('\n').trim()}
            />
        }

        // To make texts on the same line
        // Treat all the texts as one text
        return ( 
          <Text key={index}>
            {part.map((part, index) => {
              const textPart = text.substring(part.start, part.end);
      
              if(part.type === 'normal') {
                return <Text selectable key={index} style={style}>{textPart.trim()}</Text>
              }
        
              if(part.type === 'single') {
                return <Text selectable key={index} style={[style, {
                  fontSize: (style.fontSize || 18),
                  fontWeight: 'bold',
                }]}>{textPart}</Text>
              }
            })}
          </Text>
        );
      });
    }
    else {
      elements = (
      <Text 
      style={style}
      selectable
      >
      {text.trim()}
      </Text>
      );
    }

    return (
      <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
      >
        {elements}
      </View>
    );
  }
