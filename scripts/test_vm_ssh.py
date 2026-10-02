import paramiko

def probe_vm():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print("Connecting to 127.0.0.1:2222...")
        ssh.connect('127.0.0.1', port=2222, username='vega', password='Vega48b3c0de29504da5af7d4e0865ce6bb7', timeout=10)
        print("SSH Connection successful!")
        commands = [
            'uname -a',
            'ls -la /dev/kvm',
            'egrep -c "(vmx|svm)" /proc/cpuinfo',
            'ls -la /home/vega',
            'which vega',
            'which vda'
        ]
        for cmd in commands:
            stdin, stdout, stderr = ssh.exec_command(cmd)
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            print(f"=== CMD: {cmd} ===")
            if out:
                print(f"STDOUT:\n{out}")
            if err:
                print(f"STDERR:\n{err}")
        ssh.close()
    except Exception as e:
        print("SSH ERROR:", e)

if __name__ == '__main__':
    probe_vm()
