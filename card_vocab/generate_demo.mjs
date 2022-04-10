
import * as fs from 'fs/promises';


const demoCard = {
  vocab: 'อักษรไทย',
  hint: '[x]',
  
  vocab_transcription: 'ak1-sɔɔn4 thai0',
  vocab_translation: 'Thai script',
  notes: `
    <p>
      A very long link: <a href="https://en.wikipedia.org/wiki/Thai_Kedmanee_keyboard_layout">https://en.wikipedia.org/wiki/Thai_Kedmanee_keyboard_layout</a>
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed commodo dolor libero, nec aliquam urna malesuada interdum. Morbi in metus vel ex tempor malesuada. Etiam tincidunt imperdiet nibh, id tempor tortor dictum varius. Aenean mollis tempus mauris et consectetur. Praesent ac felis sit amet odio consequat tincidunt at ac velit. Curabitur metus lectus, molestie accumsan mauris vel, tincidunt vestibulum magna.
    </p>
    <p>Some Thai: อักษรไทย /ak1-sɔɔn4 thai0/</p>
    <p><img src="./media/buddha.jpg"></p>
    <p>
      Integer interdum, nisl rutrum dignissim vehicula, mauris diam cursus felis, in interdum elit sapien eu enim. Nullam ac ultricies leo, ac convallis massa. Aenean id dapibus dolor, et ultrices justo. Sed id ligula quis libero congue maximus sit amet sollicitudin velit. Etiam eleifend felis ut rutrum congue.
    </p>
  `,
};

const render = (template, card) => {
  let result = template;
  
  // Get all used conditional keys (e.g. `{{#foo}}`)
  const conditionalKeys = Array.from(new Set(
    Array.from(template.matchAll(/\{\{#([a-zA-Z0-9_-]+?)\}\}/gs)).map(match => match[1])
  ));
  
  // Replace conditionals
  // Note: we assume that all conditionals are well-formed (balanced nesting of start/end tags)
  result = conditionalKeys.reduce(
    (template, conditionalKey) => {
      const re = new RegExp(String.raw`\{\{#${conditionalKey}\}\}(.+?)\{\{/${conditionalKey}\}\}`, 'gs');
      return template.replace(re, (match, body) => {
        if (Object.prototype.hasOwnProperty.call(card, conditionalKey)) {
          return body;
        } else {
          return '';
        }
      });
    },
    result,
  );
  
  // Replace fields (e.g. `{{foo}}`)
  result = result.replace(/\{\{([a-zA-Z0-9_-]+?)\}\}/gs, (match, fieldKey) => {
    return card?.[fieldKey] ?? `{{${fieldKey}}}`;
  });
  
  return result;
};


const main = async () => {
  const templateStyle = (await fs.readFile('./vocab_style.html')).toString();
  const templateFront = (await fs.readFile('./vocab_front.html')).toString();
  const templateBack = (await fs.readFile('./vocab_back.html')).toString();
  
  // Simulate the HTML structure of Anki's card viewer
  const frontHtml = render(templateFront, demoCard);
  const backHtml = render(templateBack, { ...demoCard, FrontSide: frontHtml });
  const cardHtml = `
    <body class="card card1 isMac">
      <style>
      ${templateStyle}
      </style>
      
      <div id="qa">
        ${backHtml}
      </div>
    </body>
  `;
  
  const demoHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Anki card – Thai vocab</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      ${cardHtml}
    </html>
  `;
  
  await fs.writeFile('./demo.html', demoHtml);
};

await main();
