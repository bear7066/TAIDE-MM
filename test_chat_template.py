from transformers import AutoTokenizer

MODEL = "taide/TAIDE-LX-7B-Chat"  # 換成你用的 model

tokenizer = AutoTokenizer.from_pretrained(MODEL)

messages = [
    {"role": "system", "content": "你是一個有幫助的助手。"},
    {"role": "user", "content": "你好，請自我介紹。"},
]

# apply_chat_template 把 messages 轉成 model 看得懂的 prompt string
prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,       # False = 回傳字串，True = 回傳 token ids
    add_generation_prompt=True,  # 在結尾加上 assistant 的起始 token
)

print(prompt)
