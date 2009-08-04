<?php
	header("Content-Type: text/javascript");

	/* Definitions */
	define('FILE_DATA', 'jchat.data/jchat.data.public');
	define('SHOW_LINES', 30);

	/* jChat Class */
	class jChat
	{
		public function error($message)
		{
				echo json_encode(array("Error" => "jChat Error::{$message}"));
				exit;
		}

		private function getChatFile($type = "r")
		{
			$chatFile = @fopen(FILE_DATA, $type);
			if(!$chatFile)
			{
				jChat::error("could not open datafile");
			}
			return $chatFile;
		}

		public function getMessages()
		{
			$chatFile = jChat::getChatFile();
			$chatData = fread($chatFile, filesize(FILE_DATA));
			fclose($chatFile);
			echo json_encode(array("Data" => $chatData));
		}

		public function say($message)
		{
			$chatFile = jChat::getChatFile("a");
			if(flock($chatFile, LOCK_EX))
			{
				fwrite($chatFile, "\n$message");
				flock($chatFile, LOCK_UN);
				echo json_encode(array("Success" => true));
			}
			else
			{
				$this->error("could not lock file to write");
			}
			fclose($chatFile);
			return true;
		}
	}

	if(!isset($_REQUEST["Function"]))
	{
		jChat::error("bad request");
	}

	/* Script Start */
	switch($_REQUEST["Function"])
	{
		case 'REFRESH':
			jChat::getMessages();
			break;
		case 'SAY':
			jChat::say($_REQUEST["Message"]);
			break;
	}
?>