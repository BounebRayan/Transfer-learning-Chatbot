from flask import Flask, request, jsonify
from flask_cors import CORS

import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer, GPT2Config
tokenizer = GPT2Tokenizer.from_pretrained('gpt2',bos_token='<BOS>', eos_token='<EOS>', pad_token='<PAD>', sep_token='<SEP>')
configuration = GPT2Config.from_pretrained('gpt2', output_hidden_states=False)
configuration.use_bos_token = True
model = GPT2LMHeadModel.from_pretrained("gpt2", config=configuration)
model.resize_token_embeddings(len(tokenizer))
model.config.pad_token_id = model.config.eos_token_id

model.load_state_dict(torch.load('model553.pth', map_location=torch.device('cpu')))


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def generate_response(prompt):
    input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
    output = model.generate(input_ids=input_ids,
    do_sample=True,
    top_k=5,
    max_length=50,
    top_p=0.8,
    num_return_sequences=1,
    temperature=0.2)
    response = tokenizer.decode(output[0], skip_special_tokens=False)
    if "<SEP>" in response:
        a,b = response.replace(prompt,"").split("<SEP>") 
    else:
        b=response.replace(prompt,"")
    x,y = b.split("<PAD>",1)
    return x.replace("<PAD>","")

app = Flask(__name__)
CORS(app)

@app.route('/generateBotReply', methods=['POST'])
def generate_bot_reply():
    user_input = request.json['user_input'] 
    bot_reply = generate_response(user_input)
    response = jsonify({"answer": bot_reply})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run()