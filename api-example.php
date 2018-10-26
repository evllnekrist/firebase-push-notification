<!-- 
	a slice from CI project.
	you can directly goto function send_notification(). 
-->

<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Web extends MX_Controller {
	function __construct(){
		parent::__construct();
		if($this->session->userdata('push_nama')==""):
		redirect(base_url().'login/home');
		endif;
		// $this->output->enable_profiler();
		$this->load->model('M_data','m_data');
	}

	public function index(){
	 	$data['title']= "PUSH TO WEB";
		$data['isi']  = 'web/form_url';\
		$this->load->view('template/wrapper',$data);
	}

	public function convert_url(){
		$send = $this->input->post('send');

		if($send == "Send"){
			$topic = $this->config->item('web_development');
			try {
				$gcm_ids = array();
				$image = $this->input->post('image');
				$type = $this->input->post('type');
				if($image == null){
					$image = 'https://cdn.my-company.com/underwood/revamp/2018/home/img/icon-2x-min.png';
				}
				if($type == 'news') {
					$image .= '?w=500';
				}

				$title = $this->input->post('title');
				$link = $this->input->post('link');

				$get_token = $this->m_data->get_tokens();
				$data_db= array(
					'data' 	=> array(	
						"title" 	=> $title,
						"message" 	=> $title,
						"type" 		=> "berita",
						"link" 		=> $link
					));
			
				$data_db=json_encode($data_db['data'],JSON_UNESCAPED_SLASHES);
				$data_save=array(	
					'message'	=> $data_db,
       				'device'	=> 'Web',
       				'user' 		=> $this->session->userdata('push_nama') 	
       			);
			
				foreach ($get_token as $key => $value) {
					$data_message = array(
									'data' 	=> array(	
										'notification'		=> array(
											"title" 		=> '',
											"tag"			=> 'my-company.com',
											"body" 			=> $title,
											"icon" 			=> $image,
											"click_action" 	=> $link
										)),
									'to'	=> $value['token']);
					$this->send_notification($data_message);
				}
				$this->m_data->save($data_save);	

				$this->session->set_flashdata('success', "The Message Has Been Sent. Success");
				redirect('administrator/home/web');
			} 
			catch(Exception $x) {
				echo "Database error, please try again"; die();
			}
			
		} else {		
			if (!empty($this->input->post('url'))) {
				list($http, $slash, $domain, $read, $year, $month, $date, $canal, $content_id, $title) = explode("/", $this->input->post('url'));
	        	$newlink  = "http://services.my-company.com/json/detail/$year/$month/$date/$canal/$content_id/";
	        	$json     = json_decode(@file_get_contents($newlink),true);
	        	if (!$json) {
	        		$json = $this->get_content($newlink);
				}
				
				if (!empty($json)){
				list($domain, $path) = explode('/read', $this->input->post('url'));
				$exp                = explode('?', $path);
				if(count($exp) > 1) {
					$data['url'] 		= $exp[0];
				}else{
					$data['url'] 		= $path;
				}
				$data['data'] 		= $json;
				$data['url'] 		= $this->input->post('url');
				$data['isi']  = 'web/form_web';
				$this->load->view('template/wrapper',$data);
				}else{
					redirect('administrator/web');
				}
			} else {
				redirect('administrator/web');
			}
		}	
	}

	private function get_content($newlink){
				$this->load->library('Curl');
				$curl_handle=curl_init();
				curl_setopt($curl_handle, CURLOPT_URL,$newlink);
				curl_setopt($curl_handle, CURLOPT_CONNECTTIMEOUT, 2);
				curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
				$query = curl_exec($curl_handle);
				curl_close($curl_handle);
				$json  = json_decode($query,true);
				return $json;
	}

	private function send_notification($data_message){
		$this->load->library('Curl');

		$url 		= 	'https://fcm.googleapis.com/fcm/send';
 		$params 	=  	json_encode($data_message, JSON_UNESCAPED_SLASHES);
 		$api_key    =	'AAAAB7JJheY:APA91bEjGx--53j7Dph3bC21XYY34O3s9zpyT0037VQactlv9_iuDxBxea-uA0lGNBkNNQlmjpYfRCm_N-AeFTgyFPuEjQue16xzUsc2lWZ80l4rD_nY_wsek6dpMR2sHEPgZxSI1KTh';

        
        $headers= array(
            'Authorization: key=' . $api_key,
            'Content-Type: application/json'
        );

        $ch = curl_init();
       	curl_setopt($ch, CURLOPT_URL, $url);
       	curl_setopt($ch, CURLOPT_POST, true);
       	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
       	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
       	curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);  
       	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
       	curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
       	$result = curl_exec($ch);  

       	if ($result === FALSE) {
          $this->session->set_flashdata('failed', "The Message Has Not Sent");
				redirect('administrator/home');
       	}

       	curl_close($ch);
	}
}
