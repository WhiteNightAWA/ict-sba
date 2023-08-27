

data = []
while True:
    i = input()
    if i == "":
        continue
    elif i == "-":
        break
    else:
        data.append(i.split()[-1])

print(data)
